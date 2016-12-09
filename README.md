# Bitbucket Diff Tree

Chrome extension to display diff tree for Bitbucket. It will bring the DiffTree back from Bitbucket Server to Bitbucket Cloud. 

## Version History
### v1.0.5:
-------
* Support showing code changes as a tree structure in the following pages: 
    - Branches
    - Create pull request
    - View pull request
* Allow enable diff tree extension permanently

### v1.0.6:
-------
* Allow collapse/expand the diff tree region

### v1.0.7:
-------
* Navigate to corresponding comment when clicking on the "new comment notification" area at the bottom right corner
* Display diff tree when the viewer selects "ignore whitespace"

## How to install
- Chrome webstore: https://chrome.google.com/webstore/detail/bitbucket-diff-tree/pgpjdkejablgneeocagbncanfihkebpf

## How to set up on local for development

- Open Chrome browser and access chrome extensions by chrome://extensions/
- Make sure the "Developer mode" checkbox is checked
- Click on "Load unpacked extension..." and point to the "src" folder of this repo
- Finish! You will see an "B" icon added to the extension areas

## How to run the extension on local

- Open a bitbucket pull request page
- Click on "B" icon to activate the diff tree extension
- Enjoy!
