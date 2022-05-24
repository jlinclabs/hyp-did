# Authentication on JLINX

Authentication on JLINX is the management of which JLINX identities have accounts with which apps.

## Actions 

### Signup

- the human visits an app and clicks "signup"
  - the app generates a `AppUser` document and gives the user the id
- the user clicks "add account" in their identity manager and adds the id
  - the user's identity manager
    - reads the `AppUser` document
    - persists a local account record
    - live-tracks the new document's hypercore
    - generates a new `AppAccount` document
      - reference to the `AppUser`.id in the header
    - display code to user (*or http post to the app url for them*)
- the user gives that code back to the app
  - the app reads the `AppAccount` document
    - confirms the header points to the right `AppUser`
    - created the user's other account records
- the user is logged in

- TODO: consider additional keys for encrypting stream content and future throw away

### Login

- the user clicks login
- the app asks for some identifier
  - this could be your AppAccount.id or your username on that app
- the app finds your account and appends an event to your AppUser event stream
  - `SessionRequested` >> `AppUser`
- the user's identity app sees this and prompts the user to approve the login
- the user clicks accept
  - her identity app then appends a reply event
    - `SessionApproved` >> `AppAccount`
    - *or if rejected* `SessionRejected` >> `AppAccount`
- the app sees this new event and the logs the user in


### Destroy


The account can be destroyed by either party by writing a `DestroyedAccount` event to either the `AppUser` or `AppAccount` event streams.


## Improvements

- I'd love a way for the user to not have to do so many manual handshake steps
  - right now an optional property of the `AppUser` document can contain an http 
    endpoint forwhich the authenticator app can use to post `AppAccount`.id back
    to, to complete the signup

- encrypt the events in each stream so only the other party can read
  - do we need to exchanging read-keys
    - can we encrypt AT the other parties identity public key?
    - if we exchange keys for each document you can throw them away

## Documents


### Did

A distributed identifier 

*EventStream*


### AppUser

A user of this app. The app authors this document.

*EventStream*

#### Events

- SessionRequested
- DestroyedAccount

### AppAccount

An account on an app. The user authors this document.

*EventStream*

#### Header

- ref: AppUser.id

#### Events

- SessionApproved
- SessionDenied
- DestroyedAccount
- SetProfile

### UserProfile

*KeyValueStore*
