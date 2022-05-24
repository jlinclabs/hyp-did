# Membership on JLINX

Controls a set of JLINX Identityes as members to anything you need.

**WARNING** *i'm not sold on generalizing this yet*

## Documents

### Memberships

*EventStream*

#### Events

##### AddedMember
##### RemovedMember

### Membership

**KeyValueStore*





## Joining

1. A `Memberships` Document is created
2. A `Membership` Document is created with the `Memberships` id in its header
3. The owner of the `Memberships` Document is given the `Membership` id
4. The owner appends a `AddedMember` event is to the `Memberships` EventStream



Does your thing need N members?

The state of the chat channel comes from braiding all the streams together

the main chat channel stream defines a set of member streams

chat channel has many members
chat channel members have one ChatChannelMembership
chat channel members stream have one profile


