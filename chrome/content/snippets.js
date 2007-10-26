var snippets = [
    {
        type: 'Contact Management',
        name: 'Request roster',
        data:
            <iq type="get">
            <query xmlns="jabber:iq:roster"/>
            </iq>
    },
    {
        type: 'Contact Management',
        name: 'Add contact',
        data:
            <presence to="[CONTACT_JID]" type="subscribe"/>
    },
    {
        type: 'Multi-User Chat',
        name: 'Join room',
        data:
            <presence to="[ROOM_JID]">
            <x xmlns="http://jabber.org/protocol/muc"/>
            </presence>
    },

    {
        type: 'Multi-User Chat',
        name: 'Retrieve room configuration',
        data:
            <iq type="get" to="[ROOM_JID]">
            <query xmlns="http://jabber.org/protocol/muc#owner"/>
            </iq>
    },

    {
        type: 'Multi-User Chat',
        name: 'Store bookmarks',
        data:
            <iq type="set">
            <query xmlns="jabber:iq:private">
            <storage xmlns="storage:bookmarks">
            <conference name="[ROOM_NAME]" autojoin="[BOOLEAN]" jid="[ROOM_JID]">
            <nick>[NICK]</nick>
            <password>[PASSWORD]</password>
            </conference>
            </storage>
            </query>
            </iq>
    },

    {
        type: 'Multi-User Chat',
        name: 'Retrieve bookmarks',
        data:
            <iq type="get">
            <query xmlns="jabber:iq:private">
            <storage xmlns="storage:bookmarks"/>
            </query>
            </iq>
    },

    {
        type: 'Discover information',
        name: 'Query entity about itself',
        data:
            <iq type="get" to="[ENTITY_JID]">
            <query xmlns="http://jabber.org/protocol/disco#info"/>
            </iq>,
    },

    {
        type: 'Discover information',
        name: 'Query entity about its items',
        data:
            <iq type="get" to="">
            <query xmlns="http://jabber.org/protocol/disco#items"/>
            </iq>
    },

    {
        type: 'Discover information',
        name: 'Query entity about its time',
        data:
            <iq type="get" to="">
            <query xmlns="jabber:iq:time"/>
            </iq>
    },

    {
        type: 'Account management',
        name: 'Change password',
        data:
            <iq type="set">
            <query xmlns="jabber:iq:register">
            <username>[USER_JID]</username>
            <password>[PASSWORD]</password>
            </query>
            </iq>
    },

    {
        type: 'Publish/Subscribe',
        name: 'Create collection node',
        data:
            <iq type="set">
            <pubsub xmlns="http://jabber.org/protocol/pubsub">
            <create node="[NODE_NAME]"/>
            <configure>
            <x type="submit" xmlns="jabber:x:data">
            <field var="FORM_TYPE" type="hidden">
            <value>http://jabber.org/protocol/pubsub#node_config</value>
            </field>
            <field var="pubsub#node_type">
            <value>collection</value>
            </field>
            </x>
            </configure>
            </pubsub>
            </iq>
    },

    {
        type: 'Publish/Subscribe',
        name: 'Delete node',
        data:
            <iq type="set">
            <pubsub xmlns="http://jabber.org/protocol/pubsub#owner">
            <delete node="[NODE_NAME]"/>
            </pubsub>
            </iq>
    }
];

