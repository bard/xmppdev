/*
 * Copyright 2006-2007 by Massimiliano Mirra
 * 
 * This file is part of xmppdev.
 * 
 * xmppdev is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the
 * Free Software Foundation; either version 3 of the License, or (at your
 * option) any later version.
 * 
 * xmppdev is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * 
 * Author: Massimiliano Mirra, <bard [at] hyperstruct [dot] net>
 *  
 */


// GLOBAL DEFINITIONS
// ----------------------------------------------------------------------

var Cc = Components.classes;
var Ci = Components.interfaces;


var xmpp = xmpp || {};
xmpp.ui = xmpp.ui || {};

const ns_roster = new Namespace('jabber:iq:roster');




// GLOBAL STATE
// ----------------------------------------------------------------------

var channel;
var inputHistory = [];
var inputHistoryCursor;


// GUI INITIALIZATION/FINALIZATION
// ----------------------------------------------------------------------

function init(event) {
    if(!event.target)
        return;
    
    channel = XMPP.createChannel();
    channel.on({stanza: function(s) { return s != undefined; }}, log);

    xmpp.ui.refreshAccounts(_('xmpp-popup-accounts'));

    var result;
    XMPP.accounts.forEach(
        function(account) {
            if(result)
                return;
            if(XMPP.isUp(account.jid))
                result = account;
        });
    if(result)
        _('accounts').value = result.jid;


    snippetTreeView.init(snippets);
    _('templates').view = snippetTreeView;
    
    _('input').focus();

    _('log').addEventListener('load', function(event) {
        loadedLog(event);
    }, true);
    
    resetLog();
}

function finish() {
    channel.release();
}


// GUI UTILITIES (GENERIC)
// ----------------------------------------------------------------------

function _(id) {
    return document.getElementById(id);
}

function getDescendantByAttribute(element, attrName, attrValue) {
    for each(var child in element.childNodes) {
        if(child.nodeType == Node.ELEMENT_NODE) {
            if(child.getAttribute(attrName) == attrValue)
                return child;
            else {
                var descendant = getDescendantByAttribute(child, attrName, attrValue);
                if(descendant)
                    return descendant;                
            }
        }
    }
    return null;
}


// GUI ACTIONS
// ----------------------------------------------------------------------

function filterCache(textbox) {
    var q = textbox.value;
    var results;
    try {
        switch(q[0]) {
        case '/':
            results = XMPP.service.wrappedJSObject.cache.all(q);
            break;
        case '{':
            results = XMPP.service.wrappedJSObject.cache.fetch(eval('(' + q + ')'));
            break;
        default:
            results = XMPP.service.wrappedJSObject.cache.all(
                eval('(new Query()).' + q + '.compile()'));
        }
        textbox.style.color = '';
    } catch(e) {
        textbox.style.color = 'red';
    }

    if(results) {
        var entries;
        if('length' in results) {
            entries = results.map(function(result) {
                return new XML(serialize(result.stanza)).toXMLString();
            });
        } else {
            entries = [];
            for(var i=0; i<results.snapshotLength; i++)
                entries.push((new XML(serialize(results.snapshotItem(i)))).toXMLString());
        }

        _('cache-view').value = entries.join('\n\n');
    }
}

function resetLog() {
    _('log').contentDocument.location.href= 'log.xml';
}

function asDOM(object) {
    var _ = arguments.callee;
    _.parser = _.parser ||
        Cc['@mozilla.org/xmlextras/domparser;1'].getService(Ci.nsIDOMParser);

    var element;
    switch(typeof(object)) {
    case 'xml':
        element = _.parser
        .parseFromString(object.toXMLString(), 'text/xml')
        .documentElement;
        break;
    case 'string':
        element = _.parser
        .parseFromString(object, 'text/xml')
        .documentElement;
        break;
    default:
        // XXX use xpcom exception
        throw new Error('Argument error. (' + typeof(object) + ')');
    }

    return element;
}

function log(event) {
    XML.prettyPrinting   = true;
    XML.ignoreWhitespace = true;

    var stanza = event.stanza.copy();
    stanza.dump =
        <dump xmlns="http://dev.hyperstruct.net/xmpp4moz#console" direction={event.direction}>
        <serialized>{event.stanza.toXMLString()}</serialized>
        <account>{event.account}</account>
        </dump>;

    var logDoc = _('log').contentDocument;
    var node;
    try {
        node = logDoc.adoptNode(asDOM(stanza), true)
    } catch(e) {
        node = logDoc.importNode(asDOM(stanza), true);
    }
    logDoc.documentElement.appendChild(node);
}

function loadedLog(event) {
    var frame = event.currentTarget;
    var doc = frame.contentDocument;
    var win = frame.contentWindow;

    frame.wantBottom = true;

    doc.documentElement.addEventListener(
        'DOMNodeInserted', function(event) {
            if(frame.wantBottom)
                win.scrollTo(0, win.scrollMaxY);
        }, false);

    win.addEventListener('scroll', function(event) {
        frame.wantBottom = isNearBottom(win);
    }, false);
}

var snippetTreeView = {
    init: function(templates) {
        for each(var template in templates) {
            this.childData[template.type] = this.childData[template.type] || [];
            this.childData[template.type].push(template.name);
        }
        
        for(var name in this.childData) {
            this.visibleData.push([name, true, false]);
        }
    },

    childData : {},
    visibleData: [],

    treeBox: null,
    selection: null,
    
    get rowCount()              { return this.visibleData.length; },
    setTree: function(treeBox)         { this.treeBox = treeBox; },
    getCellText: function(idx, column) { return this.visibleData[idx][0]; },
    isContainer: function(idx)         { return this.visibleData[idx][1]; },
    isContainerOpen: function(idx)     { return this.visibleData[idx][2]; },
    isContainerEmpty: function(idx)    { return false; },
    isSeparator: function(idx)         { return false; },
    isSorted: function()               { return false; },
    isEditable: function(idx, column)  { return false; },
    
    getParentIndex: function(idx) {
        if(this.isContainer(idx))
            return -1;
        for(var t = idx - 1; t >= 0 ; t--)
            if(this.isContainer(t))
                return t;
    },
    getLevel: function(idx) {
        if(this.isContainer(idx))
            return 0;
        return 1;
    },
    hasNextSibling: function(idx, after) {
        var thisLevel = this.getLevel(idx);
        for (var t = idx + 1; t < this.visibleData.length; t++) {
            var nextLevel = this.getLevel(t)
            return (nextLevel == thisLevel)
        }
    },
    toggleOpenState: function(idx) {
        var item = this.visibleData[idx];
        if(!item[1]) return;
        
        if(item[2]) {
            item[2] = false;
            
            var thisLevel = this.getLevel(idx);
            var deletecount = 0;
            for (var t = idx + 1; t < this.visibleData.length; t++) {
                if(this.getLevel(t) > thisLevel) deletecount++;
                else break;
            }
            if(deletecount) {
                this.visibleData.splice(idx + 1, deletecount);
                this.treeBox.rowCountChanged(idx + 1, -deletecount);
            }
        } else {
            item[2] = true;
            
            var label = this.visibleData[idx][0];
            var toinsert = this.childData[label];
            for (var i = 0; i < toinsert.length; i++) {
                this.visibleData.splice(idx + i + 1, 0, [toinsert[i], false]);
            }
            this.treeBox.rowCountChanged(idx + 1, toinsert.length);
        }
    },
    
    getImageSrc: function(idx, column) {},
    getProgressMode : function(idx,column) {},
    getCellValue: function(idx, column) {},
    cycleHeader: function(col, elem) {},
    selectionChanged: function() {},
    cycleCell: function(idx, column) {},
    performAction: function(action) {},
    performActionOnCell: function(action, index, column) {},
    getRowProperties: function(idx, column, prop) {},
    getCellProperties: function(idx, column, prop) {},
    getColumnProperties: function(column, element, prop) {},
};


// ----------------------------------------------------------------------
// GUI REACTIONS

function clickedTemplate(event){
    var tree = event.target.parentNode;
    var row = { }, col = { }, child = { };
    tree.treeBoxObject.getCellAt(event.clientX, event.clientY, row, col, child);
    
    var parentIndex = tree.view.getParentIndex(row.value);
    if(parentIndex != -1)
        selectedTemplate(getTemplate(
            tree.view.getCellText(parentIndex, col.value),
            tree.view.getCellText(row.value, col.value)));
}

function selectedTemplate(template) {
    _('input').value = template.data.toXMLString();
}

function gotoHistoryPrevious() {
    if(inputHistoryCursor == 0)
        inputHistoryCursor = inputHistory.length-1;
    else
        inputHistoryCursor--;
        
    _('input').value = inputHistory[inputHistoryCursor];
}

function gotoHistoryNext() {
    if(inputHistoryCursor == inputHistory.length-1)
        inputHistoryCursor = 0;
    else
        inputHistoryCursor++;
        
    _('input').value = inputHistory[inputHistoryCursor];    
}

function pressedKeyInInputArea(event) {
    var textBox = event.currentTarget;

    if(!event.ctrlKey)
        return;
    
    switch(event.keyCode) {
    case KeyEvent.DOM_VK_UP:
        event.preventDefault();
        gotoHistoryPrevious();
        break;
    case KeyEvent.DOM_VK_DOWN:
        event.preventDefault();
        gotoHistoryNext();
        break;
    case KeyEvent.DOM_VK_RETURN:
        event.preventDefault();
                
        if(textBox.value.match(/^\s*$/))
            return;

        try {
            sendStanza(_('accounts').value, new XML(textBox.value));
            textBox.value = '';
        } catch(e) {
            alert(e);
        }
        break;
    }
}

function requestedSend() {
    try {
        sendStanza(_('accounts').value, new XML(_('input').value));
        _('input').value = '';
    } catch(e) {
        alert(e)
    }
}


// ----------------------------------------------------------------------
// NETWORK ACTIONS

function sendStanza(account, xml) {
    XMPP.send(account, xml);
    inputHistoryCursor = 0;
    inputHistory.push(xml.toXMLString());
}


// UTILITIES
// ----------------------------------------------------------------------

function getTemplate(type, name) {
    for each(var template in snippets) {
        if(template.type == type && template.name == name)
            return template;
    }
    return null;
}

function serialize(node) {
    return (Cc['@mozilla.org/xmlextras/xmlserializer;1']
            .getService(Ci.nsIDOMSerializer)
            .serializeToString(node));
}

function isNearBottom(window, threshold) {
    return Math.abs(window.scrollMaxY - window.pageYOffset) < (threshold || 24);
}
