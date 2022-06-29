// router.js

const stream = require('stream');
const express = require('express');
const multerFC = require('multer');
const { google } = require('googleapis');
const fs = require('fs');

const uploadRouter = express.Router();
//const upload = multer();

const Multer = require('multer');
// import Multer from "multer";

// const uploadFile = async (fileObject) => {
  // const bufferStream = new stream.PassThrough();
  // bufferStream.end(fileObject.buffer);
  // //console.log(bufferStream)
  // const { data } = await google.drive({ version: 'v3' }).files.create({
    // media: {
      // mimeType: fileObject.mimetype,
      // body: bufferStream,
    // },
    // requestBody: {
      // name: fileObject.originalname,
      // parents: ['17HtmIgPahxaBxkyyNMUFiKExCMg4FJ1y'],
    // },
    // fields: 'id',
  // });
  // console.log(`Uploaded file ${data.name} ${data.id}`);
// };

// uploadRouter.post('/upload', upload.any(), async (req, res) => {
	// console.log('start uploading');
  // try {
    // const { body, files } = req;
	// //console.log(body,files);
    // for (let f = 0; f < files.length; f += 1) {
		// console.log(files[f]);
      // await uploadFile(files[f]);
    // }

    // console.log(body);
    // res.status(200).send('Form Submitted');
  // } catch (f) {
    // res.send(f.message);
  // }
// });


const multer = Multer({
  storage: Multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, `${__dirname}/img-files`);
    },
    filename: function (req, file, callback) {
      callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const authenticateGoogle = () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: `${__dirname}/service-account-key-file.json`,
    scopes: "https://www.googleapis.com/auth/drive",
  });
  return auth;
};

const uploadToGoogleDrive = async (file, auth) => {
  const fileMetadata = {
    name: file.originalname,
    parents: ["17HtmIgPahxaBxkyyNMUFiKExCMg4FJ1y"], // Change it according to your desired parent folder id
  };

  const media = {
    mimeType: file.mimetype,
    body: fs.createReadStream(file.path),
  };

  const driveService = google.drive({ version: "v3", auth });

  const response = await driveService.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: "id",
  });
  return response;
};

const deleteFile = (filePath) => {
  fs.unlink(filePath, () => {
    console.log("file deleted");
  });
};

uploadRouter.post('/upload', multer.any(), async (req, res, next) => {
  try {
	  //console.log(req.file,req.files[0]);
    if (!req.files[0]) {
		console.log("error coming on file retrieve");
      res.status(400).json({
		  "status": 400,
		  "message": "File not found"
	  });
      return;
    }
	console.log("Files came successfully");
	//console.log(req.file,req.files)
	
    const auth = authenticateGoogle();
	let response;
	const files = req.files;
	for (let f = 0; f < files.length; f += 1) {
		response = await uploadToGoogleDrive(files[f], auth);
		deleteFile(files[f].path)
		// console.log(files[f]);
		console.log('uploaded file number:' + String(f+1));
    }
    // const response = await uploadToGoogleDrive(req.files[0], auth);
    // deleteFile(req.files[0].path);
    res.status(200).json({
		"status": 200,
		"id": response.data['id'],
		"message": "File uploaded"
		});
  } catch (err) {
    console.log(err);
  }
});


uploadRouter.get('/status',(req,res,next)=>{
	try{
		console.log('API status: API working good',req.id || req.params.id);
		res.status(200).json({
			"message": "API working fine\nyou can start your uploading"
		})
	}catch(err){
		console.log('API status:' + err);
	}
});

module.exports = uploadRouter;
