/*
 * Copyright 2006-2007 by Massimiliano Mirra
 * 
 * This file is part of SamePlace.
 * 
 * SamePlace is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the
 * Free Software Foundation; either version 3 of the License, or (at your
 * option) any later version.
 * 
 * SamePlace is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * 
 * The interactive user interfaces in modified source and object code
 * versions of this program must display Appropriate Legal Notices, as
 * required under Section 5 of the GNU General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU General Public License
 * version 3, modified versions must display the "Powered by SamePlace"
 * logo to users in a legible manner and the GPLv3 text must be made
 * available to them.
 * 
 * Author: Massimiliano Mirra, <bard [at] hyperstruct [dot] net>
 *  
 */


// GUI REACTIONS
// ----------------------------------------------------------------------

window.addEventListener('DOMContentLoaded', function(event) {
    var xulEdit = document.createElement('button');
    xulEdit.setAttribute('label', 'Edit');
    xulEdit.setAttribute('accesskey', 'E');
    xulEdit.setAttribute('oncommand', 'requestedEditScriptlet(this);');
    $('#blueprints > .scriptlet .actions')._.insertBefore(xulEdit, $('#blueprints > .scriptlet .actions .uninstall')._);
}, false);


function requestedEditScriptlet(xulEdit) {
    edit($(xulEdit).$('^ .scriptlet .filename')._.value);
}

function requestedCreateScriptlet() {
    var name = { value: 'unnamed' };

    var confirm = srvPrompt.prompt(
        null, 'Creating scriptlet', 'Choose a name for the scriptlet.  Filename will be <name>.js ', name, null, {});

    if(confirm)
        createScriptlet(name.value + '.js');
}


// GUI ACTIONS
// ----------------------------------------------------------------------

function edit(fileName) {
    window.openDialog('chrome://xmppdev/content/scriptlet_editor/scriptlet_editor.xul',
                      'SamePlace:ScriptletEditor', '',
                      scriptlets.get(fileName));
}

function createScriptlet(name) {
    try {
        var scriptlet = scriptlets.create(name, 'chrome://xmppdev/content/scriptlet_editor/scriptlet_sample.js');
        scriptlet.enable();
        edit(scriptlet.fileName);
        refreshScriptlets();
    } catch(e) {
        window.alert(e);
    }
}

