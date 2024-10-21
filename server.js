// const express = require('express');
// const multer = require ('multer');
// const path = require('path');
// const fs = require('fs');
// const crypto = require('crypto'); 

// const app = express();
// const PORT = 3000;

// // set up multer to store uploaded files in uploads folder
// const upload = multer({dest: 'uploads'});

// app.use(express.static(path.join(__dirname, 'public')));



// app.get('/home', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
//   });

//   app.get('/files', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
//   });

//   app.get('/settings', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
//   });


// //route to handle file upload
// app.post('/upload', upload.single('file'), (req, res) => {
//     if (!req.file) {
//       return res.status(400).send('No file uploaded.');
//     }
//     // File info is available in req.file
//     console.log('File uploaded successfully:', req.file);
    
//     // You can implement additional FIM logic here (e.g., file integrity check)
//  const filepath = req.file.path;

//  // readin the file
//  fs.readFile(filepath, 'utf8', (err,data)=>{
//     if(err){
//         return res.status(500).send('error in reading file');
//     }
//     console.log(data);

//      // Create a SHA-256 hash of the file content for FIM
//  const hash = crypto.createHash('sha256').update(data, 'utf8').digest('hex');
//  console.log('File hash (SHA-256):', hash);

//  // Send file content and hash back to the client
//  res.send(`
//    <h3>File uploaded successfully</h3>
//    <p>File content: <pre>${data}</pre></p>
//    <p>File hash (SHA-256): <strong>${hash}</strong></p>
//  `);
//  })




    

//   });

//   app.listen(PORT, ()=>{
//     console.log('server is running ................')
//   })

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto'); 

const app = express();
const PORT = 3000;

// Set up multer to store uploaded files in uploads folder by original filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);  // Save with the original filename
  }
});
const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, 'public')));

// Serve different pages (sidebar)
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views/index.html'));
});
app.get('/files', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views/files.html'));
});
app.get('/settings', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views/about.html'));
  });
  
// Function to generate SHA-256 hash of a file 
const generateFileHash = (filePath) => {
  const fileBuffer = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  return hash;
};


app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  
  // Generate hash for the uploaded file
  const filePath = req.file.path;
  const fileHash = generateFileHash(filePath);

  // Store the filename and hash in a hash file for FIM (can also use a database)  we will use Db we yesterday we have created user model to store database 
  const hashFilePath = 'file_hashes.json';
  let fileHashes = {};

  // Read existing hashes if the file exists
  if (fs.existsSync(hashFilePath)) {   // asynchronous 
    const rawData = fs.readFileSync(hashFilePath);
    fileHashes = JSON.parse(rawData);
  }

  // Prevent re-upload of the same file  
  if (fileHashes[req.file.originalname] && fileHashes[req.file.originalname] === fileHash) {
    return res.status(400).send('File with identical content already uploaded.');
  }

  // Store the new file's hash
  fileHashes[req.file.originalname] = fileHash;
  fs.writeFileSync(hashFilePath, JSON.stringify(fileHashes, null, 2));

  res.send(`
    <h3>File uploaded successfully</h3>
    <p>File hash (SHA-256): <strong>${fileHash}</strong></p>
  `);
});

// const watchDirectory = (dir) => {
//     fs.watch(dir, (eventType, filename) => {
//       if (filename && eventType === 'change') {
//         console.log(`File ${filename} has been modified.`);
        
//         const filePath = path.join(dir, filename);
//         const currentHash = generateFileHash(filePath);
//         const hashFilePath = 'file_hashes.json';
  
//         if (fs.existsSync(hashFilePath)) {
//           const fileHashes = JSON.parse(fs.readFileSync(hashFilePath));
          
//           if (fileHashes[filename] && fileHashes[filename] !== currentHash) {
//             console.error(`ALERT: File integrity compromised for ${filename}`);
//           } else {
//             console.log(`${filename} is intact.`);
//           }
//         }
//       }
//     });
//   };
  
//   // Start watching the 'uploads' directory
//   watchDirectory(path.join(__dirname, 'uploads'));

// Periodically check for file integrity (every 5 seconds)
setInterval(() => {
  console.log('Checking file integrity...');
  const hashFilePath = 'file_hashes.json';

  if (fs.existsSync(hashFilePath)) {
    const fileHashes = JSON.parse(fs.readFileSync(hashFilePath));
    
    Object.keys(fileHashes).forEach((fileName) => {
      const filePath = path.join(__dirname, 'uploads', fileName);
      if (fs.existsSync(filePath)) {
        const currentHash = generateFileHash(filePath);
        if (currentHash !== fileHashes[fileName]) {
          console.error(`ALERT: File integrity compromised for ${fileName}`);
          // additionl add after authentication do it tommorroewwwwwwwwwwwwwwwwwwwwwww
        } else {
          console.log(`${fileName} is intact.`);
        }
      } else {
        console.error(`ALERT: File ${fileName} not found.`);
      }
    });
  }
}, 5000); 



app.listen(PORT, () => {
  console.log('Server is running on port', PORT);
});
