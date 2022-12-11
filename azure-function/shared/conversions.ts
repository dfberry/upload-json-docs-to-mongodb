const { StringDecoder } = require('node:string_decoder');

export function convertBufferToJson(bufferData){
    const decoder = new StringDecoder('utf8');
    const jsonAsString = decoder.write(bufferData);
    const jsonAsObject = JSON.parse(jsonAsString);
    return jsonAsObject;
    
}