const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors')


const app = express();
const port = 4000;


const androidPath = path.join( '/Users/apple/Projects/demo/AwesomeProject/android');
const jsonfilePath = path.join( '/Users/apple/Projects/demo/AwesomeProject/');

app.use(bodyParser.json());
app.use(cors())

app.post('/build-apk', async(req, res) => {
    console.log('req',req?.body);
    const {baseUrl,statusBarColor} =req.body
    console.log('innn build');
   

    const filePath = path.join(jsonfilePath, `data.json`);
    await fs.writeFile(filePath, JSON.stringify([{url:baseUrl,color:statusBarColor}], null, 2), (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to write file' });
        }
    });
    
    exec('./gradlew assembleRelease', { cwd: androidPath }, async(error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).send('Error occurred during APK build.');
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return res.status(500).send('APK build process failed.');
        }
        console.log(`Stdout: ${stdout}`);
        // res.send('APK built successfully!');
        const apkPath = path.join(androidPath, 'app/build/outputs/apk/release/app-release.apk');
        if (fs.existsSync(apkPath)) {
            console.log('inono');
            // res.status(200).send(`
            //     <p>APK built successfully!</p>
            //     <a href="/download-apk">Download APK</a>
            // `);
            res.status(200).json({ message: 'Build created successfully',status:200 });
          
        } else {
            res.status(500).send('APK file not found.');
        }
    });
});

app.get('/download-apk', async(req, res) => {
    console.log('dwl');
    const apkPath = path.join(androidPath, 'app/build/outputs/apk/release/app-release.apk');
    await res.download(apkPath)
    // await res.download(apkPath, 'app-release.apk', (err) => {
    //     if (err) {
    //         console.error(`Error during APK download: ${err}`);
    //         res.status(500).send('Error occurred during APK download.');
    //     }
    // });

});


app.get('/clean',(req, res) => {
    console.log('innn clean');
    const androidPath = path.join( '/Users/apple/Projects/demo/AwesomeProject/android');
    exec('./gradlew clean', { cwd: androidPath }, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).send('Error occurred during APK clean build.');
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return res.status(500).send('APK clean build failed.');
        }
        console.log(`Stdout: ${stdout}`);
        res.send('APK clean build successfully!');
    });

})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});