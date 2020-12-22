# Bitbucket Diff Tree

Chrome extension to display diff tree for Bitbucket. It will bring the DiffTree back from Bitbucket Server to Bitbucket Cloud. 

![BitbucketDiffTree on GitHub](dist/screenshot_1280x800.png)

## Version History
### v1.0.5:
* Support showing code changes as a tree structure in the following pages: 
    - Branches
    - Create pull request
    - View pull request
* Allow enable diff tree extension permanently

### v1.0.6:
* Allow minimizing the diff tree region

### v1.0.7:
* Navigate to corresponding comment when clicking on the "new comment notification" area at the bottom right corner
* Display diff tree when the viewer selects "ignore whitespace"

### v1.0.8:
* Option to compact empty middle packages
* Show diff tree on commits page

### v1.1:
* Allow collapsing / expanding all folders
* Fix for tab size and nasty css bug which breaks alignments

### v1.2:
* Track files have been reviewed by clicking on the "..." icon on the left of the files

### v1.3:
* Show new version indicator for Bitbucket Diff Tree

### v1.3.1:
* Fix bug: Should navigate to the correct file based on the hash of the url (if any)

### v1.4:
* Allow resizing the diff tree

### v1.5:
* Allow searching files and folders in the diff tree

### v1.6:
* Unset the "reviewed" status of a file if its contents changed

### v1.7
* Allow filtering files by review, unreview and comment status

### v1.8.0
* Grant "tabs" permission when needed to comply with Google Chrome "Use of permissions" policy
https://developer.chrome.com/webstore/program_policies#permissions

## How to install
- Chrome webstore: https://chrome.google.com/webstore/detail/bitbucket-diff-tree/pgpjdkejablgneeocagbncanfihkebpf

## How to set up on local for development

- Open Chrome browser and access chrome extensions by chrome://extensions/
- Make sure the __Developer mode__ checkbox is checked
- Click on __Load unpacked extension...__ and point to the __src__ folder of this repo
- Finish! You will see an __B__ icon added to the extension area

## How to run the extension on local

- Open a pull request page on bitbucket
- Click on __B__ icon to activate the diff tree extension
- Enjoy!
