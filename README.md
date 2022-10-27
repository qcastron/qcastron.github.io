[![Queen's College Astronomers' Club](img/logo-text.svg)](https://qcac.hk)

# qcac.hk

The Queen's College Astronomers' Club is dedicated to not only promoting astronomy among our brethren but also forging
bonds between them. This website was built in collaboration of students and recent graduates of our club. We are
constantly recruiting, see [qcac.hk](https://qcac.hk).

## Start Editing

These installation instructions are for Windows 10/11 only. It is possible to get the same environment setup on other
operating systems.

**Important: If you encounter any trouble, especially from `Step 16` tp `Step 19` where you are modifying the cloud code
base, STOP and ASK. You should also look it up on the internet first.**

1. Create a [GitHub account](https://github.com/).
2. Optional: Get [GitHub Education](https://education.github.com/). This will take longer for QC accounts, as it would
   likely require manual approval from GitHub. This will make step 3 easier and brings you a lot of free perks at the
   cost of time.
3. Get [Free Educational License from JetBrains](https://www.jetbrains.com/community/education/#students).
4. Download and install the latest version of [WebStorm](https://www.jetbrains.com/webstorm/), which is the IDE we are
   going to use. Create PATH and file extension associations in the installation options.
5. Download and install [git](https://git-scm.com/downloads). Check the box for creating a PATH. Otherwise, choose the
   recommended settings.
6. Download and install [Chocolatey](https://chocolatey.org/install). Don't forget to run the powershell as
   administrator. Check the box for creating a PATH. Otherwise, choose the recommended settings.
7. Download and install [SASS](https://sass-lang.com/install) by running `choco install sass` in the command prompt in
   administrator mode.
8. Open WebStorm and login to your JetBrains account and select your license.
9. Press `Ctrl + Alt + S` to open settings. Search for `scss` and press the `+` sign to add an
   interpreter. It should be able to automatically detect the sass. Press `Test` then add the interpreter.
10. Search for `git` and press the `+` sign to add the git interpreter. It should be able to automatically detect the
    programme location. Press `Test` then add the interpreter.
11. Search for `GitHub` and press the `+` sign to add a GitHub Account.
12. Close the settings page and go back to the home screen of WebStorm. Select `Get repository from VCS` and paste
    in `https://github.com/qcastron/qcastron.github.io.git`. Click `Open`.
13. Click the `master` button in the bottom right corner. Select `origin/production` then `Checkout`.
14. You are all set. SCSS files should be recompiled into CSS automatically when changed.
15. Changes can be previewed live by pressing the browser icons on HTML pages.
16. After editing the files, press the green tick in the top right corner to commit your changes. Write a descriptive
    commit message then `Commit`.
17. Upload your changes by pressing the green arrow `Push` on next to the green tick. Select `Push`.
18. To make your changes live, go to the very left hand side, select `Pull Requests` and press the `+` button to open a
    pull request. This will open a request to merge your changes to the published version. Wait for others to review
    your changes.
19. To merge and publish your changes, press `Merge`. GitHub will then update the website within a couple of minutes.