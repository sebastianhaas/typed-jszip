import test = require('blue-tape');
import JSZip = require('jszip');

test('create a JSZip instance', t => {
  let zip: JSZip.JSZip = new JSZip();
  t.notEqual(zip, undefined);
  t.notEqual(zip, null);
  t.end();
});

test('basic manipulations', t => {
  t.plan(5);
  let zip: JSZip.JSZip = new JSZip();
  t.notEqual(zip, undefined);
  t.notEqual(zip, null);
  // create a file
  zip.file('hello.txt', 'Hello[p my)6cxsw2q');
  // oops, cat on keyboard. Fixing !
  zip.file('hello.txt', 'Hello World!\n');
  // create a file and a folder
  zip.file('nested/hello.txt', 'Hello World, again!\n');
  // same as
  zip.folder('nested').file('hello.txt', 'Hello World, again!\n');
  let photoZip: JSZip.JSZip = zip.folder('photos');
  // this call will create photos/README
  photoZip.file('README', 'a folder with photos');
  zip.file('hello.txt').async('string').then(data => {
    t.isEqual(data, 'Hello World!\n');
  });
  zip.file('nested/hello.txt').async('string').then(data => {
    t.isEqual(data, 'Hello World, again!\n');
  });
  zip.file('photos/README').async('string').then(data => {
    t.isEqual(data, 'a folder with photos');
  });
});

test('generate a zip file', t => {
  t.plan(9);
  let zip: JSZip.JSZip = new JSZip();
  t.notEqual(zip, undefined);
  t.notEqual(zip, null);
  zip.file('hello.txt', 'Hello World!\n');

  // uint8array
  if (JSZip.support.uint8array) {
    zip.generateAsync({type : 'uint8array'}).then(data => {
      let array = data as Uint8Array;
      t.isEqual(array.byteLength, 129, 'generate async as uint8array returns correct size');
    });
  } else {
    t.skip('No uint8array support');
  }

  // arraybuffer
  if (JSZip.support.arraybuffer) {
    zip.generateAsync({type : 'arraybuffer'}).then(data => {
      let buffer = data as ArrayBuffer;
      t.isEqual(buffer.byteLength, 129, 'generate async as arraybuffer returns correct size');
    });
  }  else {
    t.skip('No arraybuffer support');
  }

  // binarystring
  zip.generateAsync({type : 'binarystring'}).then(data => {
    t.isEqual(data.length, 129, 'generate async as binarystring returns correct size');
  });

  // string
  zip.generateAsync({type : 'string'}).then(data => {
    t.isEqual(data.length, 129, 'generate async as string returns correct size');
  });

  // blob
  if (JSZip.support.blob) {
    zip.generateAsync({type : 'blob'}).then(data => {
      let blob = data as Blob;
      t.isEqual(blob.size, 129, 'generate async as blob returns correct size');
    });
  }  else {
    t.skip('No blob support');
  }

  // nodebuffer
  if (JSZip.support.nodebuffer) {
    zip.generateAsync({type : 'nodebuffer'}).then(data => {
      let nodebuffer = data as Buffer;
      t.isEqual(nodebuffer.byteLength, 129, 'generate async as nodebuffer returns correct size');
    });
  }  else {
    t.skip('No nodebuffer support');
  }

  // nodestream
  if (JSZip.support.nodestream) {
    let size = 0;
    zip.generateNodeStream()
      .on('data', (chunk) => {
        size += chunk.length;
      })
      .on('end', () => {
        t.isEqual(size, 129, 'generate async as nodestream returns correct size');
      });
  } else {
    t.skip('No nodestream support');
  }
});

test('read a zip file', t => {
  t.plan(4);
  let zipSource: JSZip.JSZip = new JSZip();
  t.notEqual(zipSource, undefined);
  t.notEqual(zipSource, null);
  zipSource.file('hello.txt', 'Hello World!\n');
  zipSource.generateAsync({type : 'string'}).then(dataOut => {
    t.isEqual(dataOut.length, 129);
    let zipRead: JSZip.JSZip = new JSZip();
    zipRead.loadAsync(dataOut).then(() => {
      zipRead.file('hello.txt').async('string').then(dataIn => {
        t.isEqual(dataIn, 'Hello World!\n', 'loaded zip has correct contents');
      });
    });
  });
});
