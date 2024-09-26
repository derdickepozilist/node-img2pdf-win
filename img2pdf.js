"use strict";

const { rotate } = require('jpeg-autorotate');
const imgToPDF = require('image-to-pdf');
const sharp = require('sharp');
const fs = require('fs');

function parseCliParams()
{
    let filenames = [];
    let mode = null;

    process.argv.forEach((val, index, array) => {
        if (index === 2) {
            mode = val;
        }

        if (index >= 3) {
            filenames.push(val);
        }
    });

    if (!filenames.length) {
        process.exit(127);
    }

    return [mode, filenames];
}

async function processFiles(filenames, mode)
{
    for (let i = 0; i < filenames.length; i++) {
        try {
            const input = fs.readFileSync(filenames[i]);

            const metadata_before = await getMetadata(input);
            console.log('file information (untouched):', metadata_before);

            let isLandscape = null;

            rotate(filenames[i])
            .then(({buffer, orientation, dimensions, quality}) => {
                console.log('fetch file information (auto-rotated)');
                getMetadata(buffer)
                .then((metadata_after) => {
                    console.log('file information (auto-rotated):', metadata_after);
    
                    isLandscape = metadata_after.width > metadata_after.height;
                    pushForward(mode, buffer, filenames[i], isLandscape);

                })
                .catch((reason) => {
                    const msg = `Error while reading metadata after auto-rotation: ${reason}`;
                    console.warn(msg);
                });
            })
            .catch((reason) => {
                const msg = `Error while rotating image: ${reason}`;
                console.warn(msg);

                isLandscape = metadata_before.width > metadata_before.height;
                pushForward(mode, input, filenames[i], isLandscape);
            });
        } catch (error) {
            console.error(`Error while processing image: ${error}`);
        }
    }
}

async function pushForward(mode, maybeAutoRotatedInput, in_filename, isLandscape)
{
    try {
        const isPortrait = !isLandscape;
        let tmpfile_r_buffer = null;
        let tmpfile_l_buffer = null;

        switch (mode) {
            case 'landscape':
                if (!isLandscape) {
                    console.log('rotating portrait image to landscapes...');
                    tmpfile_r_buffer = await rotateImage(maybeAutoRotatedInput, 90);
                    tmpfile_l_buffer = await rotateImage(maybeAutoRotatedInput, 270);
                } else {
                    console.log('not rotating landscape base image');
                    tmpfile_r_buffer = await convertToJpegNevertheless(maybeAutoRotatedInput);
                    tmpfile_l_buffer = await rotateImage(maybeAutoRotatedInput, 180);
                }
                break;
            case 'portrait':
                if (!isPortrait) {
                    console.log('rotating landscape image to portraits...');
                    tmpfile_r_buffer = await rotateImage(maybeAutoRotatedInput, 90);
                    tmpfile_l_buffer = await rotateImage(maybeAutoRotatedInput, 270);
                } else {
                    console.log('not rotating portrait base image');
                    tmpfile_r_buffer = await convertToJpegNevertheless(maybeAutoRotatedInput);
                    tmpfile_l_buffer = await rotateImage(maybeAutoRotatedInput, 180);
                }
                break;
            default:
        }

        const metadata_final = await getMetadata(tmpfile_r_buffer);
        console.log('file information (final):', metadata_final);

        const outFilename_r = in_filename.replace('.jpg', '.pdf').replace('.jpeg', '.pdf').replace('.png', '.pdf').replace('.pdf', '_r.pdf');
        const outFilename_l = in_filename.replace('.jpg', '.pdf').replace('.jpeg', '.pdf').replace('.png', '.pdf').replace('.pdf', '_l.pdf');
        console.log('pdf file names', {outFilename_r, outFilename_l});

        const outFileContents_r = await saveToPdf(tmpfile_r_buffer, mode);
        const outFileContents_l = await saveToPdf(tmpfile_l_buffer, mode);
        fs.writeFileSync(outFilename_r, outFileContents_r.read());
        fs.writeFileSync(outFilename_l, outFileContents_l.read());
    } catch (error) {
        console.error(`Error while finalizing image: ${error}`);
    }
}

async function rotateImage(tmpfile, degrees = 270)
{
    try {
        return await sharp(tmpfile).rotate(degrees).jpeg({force: true, quality: 85, chromaSubsampling: '4:2:0', progressive: false}).toBuffer();
    } catch (error) {
        console.error(`Error while rotating image: ${error}`);
    }
}

async function convertToJpegNevertheless(tmpfile)
{
    try {
        return await sharp(tmpfile).jpeg({force: true, quality: 85, chromaSubsampling: '4:2:0', progressive: false}).toBuffer();
    } catch (error) {
        console.error(`Error while rotating image: ${error}`);
    }
}

async function getMetadata(tmpfile)
{
    try {
        return await sharp(tmpfile).metadata();
    } catch (error) {
        const msg = `Error while fetching metadata: ${error}`;
        console.error(msg);
        throw msg;
    }
}

async function saveToPdf(image_buff, mode)
{
    try {
        let page_size = imgToPDF.sizes.A4;
        if (mode === 'landscape') {
            page_size = [page_size[1], page_size[0]];
        }

        return imgToPDF([image_buff], page_size);
    } catch (error) {
        console.error(`Error while writing pdf: ${error}`);
    }
}

try {
    const [mode, filenames] = parseCliParams();
    processFiles(filenames, mode);
} catch (error) {
    console.error(`Error while processing images: ${error}`);
}
