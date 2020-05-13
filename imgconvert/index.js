// const azure = require('azure')
const path = require("path");
const { AbortController } = require("@azure/abort-controller");
const pdf = require("pdf-poppler");
const fs = require("fs");
const URL = require("url");
const { BlobServiceClient } = require("@azure/storage-blob");
const uuidv1 = require("uuid/v1");

const storage = require("azure-storage");

var accessKey =
  "B68hxXr/Bcc8CQc7DQrJ3cMl5IELx+XAuDZ5rEguzBbajMOCJr9b3Tq7FkGI6C+w2hq7q2f1g6JRegvuFkPuLQ==";
var storageAccount = "storageaccoumndabfa";
var containerName = "sourcepdf";
var destContainerName = "targetimage";
var blobService = storage.createBlobService(storageAccount, accessKey);

module.exports = async function (context, myBlob) {
  const ONE_MEGABYTE = 1024 * 1024;
  const FOUR_MEGABYTES = 4 * ONE_MEGABYTE;
  //const ONE_MINUTE = 60 * 1000;
  let dirName = "D:\\home\\site\\wwwroot\\ImageConverter";
  // let dirName = __dirname;
  // let rchar = '\';
  let sourceDirectory = dirName + "\\FileDownload\\" + context.bindingData.name;
  let targetDirectory = dirName + "\\targetimage\\" + context.bindingData.name;
  async function uploadLocalFile(aborter, containerClient, filePath) {
    filePath = path.resolve(filePath);

    const fileName = path.basename(filePath);
    context.log("Func " + fileName);
    const blobClient = containerClient.getBlobClient(fileName);
    const blockBlobClient = blobClient.getBlockBlobClient();
    // context.log(blockBlobClient);
    return await blockBlobClient.uploadFile(filePath, aborter);
  }
  async function streamToLocalFile(readableStream) {
    return new Promise((resolve, reject) => {
      let buffer = Buffer.from([]);
      readableStream.on("data", (data) => {
        buffer = Buffer.concat([buffer, data], buffer.length + data.length); //Add the data read to the existing buffer.
      });
      readableStream.on("end", () => {
        // context.log(sourceDirectory);
        // context.log(buffer);
        fs.writeFileSync(sourceDirectory, buffer); //Write buffer to local file.
        resolve(sourceDirectory); //Return that file path.
      });
      readableStream.on("error", reject);
    });
  }

  async function streamToString(readableStream) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      readableStream.on("data", (data) => {
        chunks.push(data.toString());
      });
      readableStream.on("end", () => {
        resolve(chunks.join(""));
      });
      readableStream.on("error", reject);
    });
  }
  const fs = require("fs");
  const request = require("request");

  const blobServiceClient = await BlobServiceClient.fromConnectionString(
    "DefaultEndpointsProtocol=https;AccountName=storageaccountramndabfa;AccountKey=B68hxXr/Bcc8CQc7DQrJ3cMl5IELx+XAuDZ5rEguzBbajMOCJr9b3Tq7FkGI6C+w2hq7q2f1g6JRegvuFkPuLQ==;EndpointSuffix=core.windows.net"
  );
  const containerClient = await blobServiceClient.getContainerClient(
    containerName
  );
  const blockBlobClient = containerClient.getBlockBlobClient(
    context.bindingData.name
  );
  context.log("Ext Name Is " + path.extname(targetDirectory));
  let opts = {
    format: "jpeg",
    out_dir: path.dirname(targetDirectory),
    out_prefix: path.basename(targetDirectory, path.extname(targetDirectory)),
    page: null,
  };

  const downloadBlockBlobResponse = await blockBlobClient.download(0);
  streamToLocalFile(downloadBlockBlobResponse.readableStreamBody).then(
    (response) => {
      return new Promise((resolve, reject) => {
        pdf
          .convert(sourceDirectory, opts)
          .then((response) => {
            context.log("Successfully converted");
            async () => {
              // let st = context.bindingData.name;
              // let targetFileName =
              //   st.substr(0, st.lastIndexOf(".")) + "-1" + ".jpg";
              // context.log("Target File Name Is " + targetFileName);
              tarDir = dirName + "\\targetimage\\";
              context.log("Target Dir Is " + tarDir);
              // context.log('Context IS:::: ' + context.executionContext.functionDirectory);
              const files = await fs.promises.readdir(tarDir);
              context.log(JSON.stringify(files));
              let moveTo =
                "https://storageaccountramndabfa.blob.core.windows.net/targetimage/";
              const ONE_MINUTE = 60 * 1000;
              const aborter = AbortController.timeout(30 * ONE_MINUTE);
              const destcontainerClient = await blobServiceClient.getContainerClient(
                destContainerName
              );

              for (const file of files) {
                context.log(file);
                await uploadLocalFile(
                  aborter,
                  destcontainerClient,
                  path.join(tarDir, file)
                );
              }
            };
          })
          .catch((error) => {
            console.error(error);
          });
      });
    }
  );

  // context.log('URI is ' + context.bindingData.uri);
  // context.log('Name is ' + context.bindingData.name);
  // context.log('Blob Trigger is ' + context.bindingData.blobTrigger);
  // context.log('Your Directory Is ' + __dirname);
  // var fileName = 'sample.pdf';
  //  var blobName = 'sourcepdf';

  // // context.log(file);
  /*
        context.log(file + ":::" + tarDir);
        const frompath = path.join(tarDir,file);
        const toPath =  moveTo + file;
        //const stat = await fs.promises.stat(frompath);
        var fstream;
        context.log(frompath + file);
        fstream = fs.createWriteStream(frompath + file);
        await blobService.createBlockBlobFromLocalFile("targetimage",file,fstream.path,
            function(error,result,response){
                if(!error) context.log("uploaded" + result);
                else context.log(error);
            }
        );
        */
  //}
  // context.log(path.extname(targetDirectory));
  // context.log(path.basename(targetDirectory, path.extname(targetDirectory)));
  // const ONE_MINUTE = 60 * 1000;
  // const aborter = AbortController.timeout(30 * ONE_MINUTE);
  // const destcontainerClient = await blobServiceClient.getContainerClient('targetimage');
  // await uploadLocalFile(aborter, containerClient, tarDir);

  //  blobService.getBlobToLocalFile(containerName,fileName,'/FileDownload/',function(error,serverBlob){
  //      context.log(error);
  //  });

  //  var containerName =  'sourcepdf';
  // blobService.getBlobToFile(
  //     containerName,
  //     blobName,
  //     'FileDownload' + '/' + blobName,
  //     function(err, blob) {
  //         if (err) {
  //             context.log("Couldn't download blob %s", blobName);
  //             context.log(err);
  //         } else {
  //             // console.log("Sucessfully downloaded blob %s to %s", blobName, fileName);
  //             // fs.readFile(fileName, function(err, fileContents) {
  //             //     if (err) {
  //             //         console.error("Couldn't read file %s", fileName);
  //             //         console.error(err);
  //             //     } else {
  //             //         console.log(fileContents);
  //             //     }
  //             // });
  //         }
  //     });
  // let writeStreamToNewBlob = blobSvc.createWriteStreamToBlockBlob('sourcepdf', 'sample.pdf', (err, res) => {if (!err) {context.log('createWriteStreamToBlockBlob successfully!');};});
  // blobSvc.getBlobToStream('sourcepdf', 'sample.pdf', writeStreamToNewBlob, (err, res) => {if (!err) {console.log('getBlobToStream successfully');};});

  // blobSvc.getBlobToStream('sourcepdf', 'sample.pdf', fs.createWriteStream(file),
  // function(error)
  // 	{
  //     		if(error)
  // 			{ //Something went wrong, write it to the console but finish the queue item and continue.
  //     			console.log("Failed writing " + blob.name + " (" + error + ")");
  //     			callback();
  //     			}
  //     		else if(!error)
  // 			{ //Write the last modified date and finish the queue item silently
  //     			fs.writeFile(file + ".date", blobLastModified, function(err)
  //     			{
  // 				if(err) console.log("Couldn't write .date file: " + err);
  // 			});
  //     		callback();
  //     	}
  //     });
  // result,
  // response)
  // {
  // //   context.log(error);
  // //   if(!error){
  // //     fs.writeFileSync(file,downloadBlockBlobResponse.readableStreamBody,
  // //     {
  // //         encoding :'base64',
  // //     });
  // //   }
  // });
  // fs.writeFileSync("/FileDownload/10111.pdf", downloadBlockBlobResponse.readableStreamBody,
  // {
  //     encoding :'base64',
  // });

  //context.log('\t', await streamToString(downloadBlockBlobResponse.readableStreamBody));
  // let file = 'D:\\home\\site\\wwwroot\\ImageConverter\\FileDownload\\passport.pdf';
  // context.log(file);
  // context.log(path.extname(file));
  // context.log(path.basename(file), path.extname(file));
  // context.log(path.basename());
  // context.log(path.dirname());
  // context.log(path.extname());

  // let opts = {
  //     format: 'jpeg',
  //     out_dir: '/targetimage/sample.jpg',
  //     out_prefix: path.baseName(file, path.extname(file)),
  //     page: null
  // }
  // context.log('started Converting');
  // pdf.convert(await streamToString(downloadBlockBlobResponse.readableStreamBody), opts)
  //     .then(res => {
  //         console.log('Successfully converted');
  //     })
  //     .catch(error => {
  //         console.error(error);
  //     })

  //context.log(context.bindingData);
  // context.log(context.bindingData.blobTrigger);
  //context.log(context.bindingData.uri);
  /*    let file = '/sourcepdf/sample.pdf';

let opts = {
    format: 'jpeg',
    out_dir: '/targetimage/sample.jpg',
    out_prefix: path.baseName(file, path.extname(file)),
    page: null
}
pdf.convert(file, opts)
    .then(res => {
        console.log('Successfully converted');
    })
    .catch(error => {
        console.error(error);
    })
*/
  //context.log("JavaScript blob trigger function processed blob \n Blob:", context.bindingData.blobTrigger, "\n Blob Size:", myBlob.length, "Bytes");
};
