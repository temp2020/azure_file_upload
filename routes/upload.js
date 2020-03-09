if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
}

const
    express = require('express')
    , router = express.Router()

    , multer = require('multer')
    , inMemoryStorage = multer.memoryStorage()
    , uploadStrategy = multer({ storage: inMemoryStorage }).single('image')

    , azureStorage = require('azure-storage')
    , blobService = azureStorage.createBlobService()

    , getStream = require('into-stream')
    , containerName = 'partlibrary'
    ;

const handleError = (err, res) => {
    res.render('error', { error: err });
};

const getBlobName = originalName => {
    const identifier = Math.random().toString().replace(/0\./, ''); // remove "0." from start of string
    return `${identifier}-${originalName}`;
};

router.post('/', uploadStrategy, (req, res) => {

    const
        blobName = getBlobName(req.file.originalname)
        , stream = getStream(req.file.buffer)
        , streamLength = req.file.buffer.length
        ;

    blobService.createBlockBlobFromStream(containerName, blobName, stream, streamLength, (err, result) => {

        if (err) {
            handleError(err);
            return;
        } else {
            //https://{{../accountName}}.blob.core.windows.net/{{../containerName}}/{{name}}
            const path = `https://bfmblob.blob.core.windows.net/taskcontainer/${result.name}`
            console.log(result);
        
            res.render('success', {
                message: `File uploaded to ${path}.`
            });
        }
    });
});

module.exports = router;