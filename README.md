# node-img2pdf-win

This is an `Windows-Tool` for converting images (jpg/jpeg/png) to PDF-documents.

It is a "just make me a pdf"-style tool for the impatient, so it will react to your needs in an overachievemental matter, creating both directions of the content placed horizontally/vertically rotated 180 degrees from each other.

This software is intentionally built to override problematic EXIF-Tags mostly coming from mobile phones being tilted a little too much over a document, so it will be auto-rotated in a wrong direction.

You only choose the outcome, if you want a landscape or a portrait output of bespoken image;  
so it puts out both remaining possibilities as a pdf the right way round and a pdf the wrong way round intentionally.

The reason lies in the wrong EXIF-Tags.

## Getting started

Clone this repo to your PC with your `Terminal`.  
(Shift+Rightclick) -> (Open in Terminal/PowerShell)
on a folder in your `Windows-Explorer` to get there directly.

`git clone git@github.com:derdickepozilist/node-img2pdf-win.git`

Check, if you have `at least Node 20+` installed an ready to run (in `Terminal`).

`node --version`

Otherwise download it from here: https://nodejs.org/en/download/prebuilt-installer  
(Enable installing NodeJS to PATH making it globally available)

## Installation

1. Open the `node-img2pdf-win` folder in your explorer and double-click on `01_npm_install.bat`
2. Create a *Shortcut* to `landscape.bat` (right click on it)->(Create shortcut)
3. Double-click on `02_go_to_sendto.bat`
4. Move the *Shortcut* there and call it `Make PDF landscape`
5. Repeat *steps 2-4* the same way with `portrait.bat`, naming it "Make PDF portrait"


## Usage

(Right-click) on one or more selected .jpg/.jpeg/.png-file and use the Send To-Menu to send it to "Make PDF landscape/portrait".

Your images will be embedded into two landscape/portrait-pdfs with A4 format and rotated in both directions (_r/_l) accordingly.  
Works with multiple files at once, too, creating both pdfs for each image you selected separately at their respective source-locations.

## Authors and acknowledgment

Vision: Dominik Niemanns  
Development: Daniel Jürgen

## Credits

* jpeg-autorotate
* sharp
* image-to-pdf
* and all implicit dependants, you are the real heroes

Find people in need running `npm fund` in your `Terminal` in the `node-img2pdf-win` folder.

## License

Free as in beer.

## Technical information:

(tl;dr: read img2pdf.js and portrait/landscape.bat)

1. Parse command line parameters,  
reserving the first parameter for portrait/landscape runmodes.
all other parameters are files to process

2. Iterate over all collected files (1+)

### Per-File:

1. Read file
2. Try to auto-rotate image according to EXIF-Information (which may be actually wrong)
3. Read the auto-rotated result again (fetch resolution information)
4. Rotate the Image according to runmode  
4.1 if the user requested portrait,  
4.1.1 but auto-rotated image is landscape,  
auto-rotation failed due to wrong EXIF-information  
leading to a 90 degree offset of unbeknownst direction  
4.1.2 so we now have 2 directions left, which will both be rotated to (90, 270)  
4.2.1 but auto-rotated image is portrait (like it should)
auto-rotation may have failed due to wrong EXIF-information (overtipping) leading to a 180 degree offset  
4.2.2 so we now have 2 directions left, which will both be rotated to (0, 180)
5. The same again, but for landscape-runmode resulting in mostly the same steps but, 90 degrees off.
6. Create output-filenames, marking them as left- and right-rotated (`_l.pdf`/`_r.pdf`)
7. Make PDFs from both images

### Resulting filename pattern:

Input:

Filename`.jpg`  

Output:

Filename`_l.pdf`  
Filename`_r.pdf`  
