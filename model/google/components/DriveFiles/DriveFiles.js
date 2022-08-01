import axios from "axios";
import {SLASH} from '../../../globals';

const url = "https://content.googleapis.com/drive/v3/files";
const url2 = "https://www.googleapis.com/drive/v3/files";
const urlV2 = "https://www.googleapis.com/drive/v2/files";

export async function DriveFiles(token, query, nextPageToken) {
    const params = {
        includeItemsFromAllDrives: true,
        orderBy: "folder,name_natural",
        pageSize: 1000,
        q: "(" + query + ") and trashed = false",
        supportsAllDrives: true,
        fields: "nextPageToken,files(properties,id,name,parents,explicitlyTrashed,mimeType,shortcutDetails,permissions(id,displayName,emailAddress,role),lastModifyingUser,webContentLink,webViewLink,ownedByMe,teamDriveId,driveId,iconLink,thumbnailLink,imageMediaMetadata/width,imageMediaMetadata/height,capabilities/canAddChildren,modifiedTime)",
        key: "AIzaSyCHoqSXT4cw1JGPhgL2YaZZ4QHNF8OyNn0",
    };
    
    if (nextPageToken) {
        params.pageToken = nextPageToken
    }

    const headers = (token !== null) ? {Authorization: token} : "";
    
    const options = {
        url: url2,
        method: 'get',
        headers,
        params
    };
    
    return await axios(options).then(response => {
        return response
    }).catch(error => {
        return error.response || {status: 0};
    })
}

export function CheckPermissionFiles(token, folderId) {
    const params = {
        supportsAllDrives: true,
        fields: "*",
        key: "AIzaSyCHoqSXT4cw1JGPhgL2YaZZ4QHNF8OyNn0",
    };
    
    const headers = (token !== null) ? {Authorization: token} : "";
    
    const options = {
        url: `${url}${SLASH}${folderId}${SLASH}permissions`,
        method: 'get',
        headers,
        params
    };
    
    return axios(options).then(response => {
        return response
    }).catch(error => {
        return error.response || {status: 0};
    })

}

export function DriveExportFileToHtml(token, driveId) {
    const params = {
        supportsAllDrives: true,
        mimeType: 'text/html',
        key: "AIzaSyCHoqSXT4cw1JGPhgL2YaZZ4QHNF8OyNn0",
    };
    
    const headers = (token !== null) ? {Authorization: token} : "";
    
    const options = {
        url: url + '/' + driveId + '/export',
        method: 'get',
        headers,
        params
    };
    
    return axios(options).then(response => {
        return response
    }).catch(error => {
        return error.response || {status: 0};
    })
}

export function DriveFilesFindById(token, googleDriveId){
    
    const getUrl = url2 + SLASH + googleDriveId;
    
    const params = {
        fields: "*",
        supportsAllDrives: true,
        key: "AIzaSyCHoqSXT4cw1JGPhgL2YaZZ4QHNF8OyNn0",
    }
    
    
    const headers = (token !== null) ? {Authorization: token} : "";
    
    const options = {
        url: getUrl,
        method: 'get',
        headers,
        params
    };
    
    return axios(options).then(response => {
        return response
    }).catch(error => {
        return error.response || {status: 0};
    })
    
}

export function DriveFileIns(token, fileName, mimeType, parentId){

    const params = {
        supportsAllDrives: true,
    }
    
    let data = {
        name:fileName,
        mimeType: mimeType,
        parents:[parentId]
    }
    
    const headers = (token !== null) ? {Authorization: token} : "";
    
    const options = {
        url: url2,
        method: 'POST',
        headers,
        params,
        data
    };
    
    return axios(options).then(response => {
        return response
    }).catch(error => {
        return error.response || {status: 0};
    })
}

export function DriveFilesInsProperties(token, fileId, propertyName, value ) {
    
    const params = {
        includeItemsFromAllDrives: true,
        supportsAllDrives: true,
        key: "AIzaSyCHoqSXT4cw1JGPhgL2YaZZ4QHNF8OyNn0",
    };
    
    
    let data = {
        key: propertyName,
        value: value,
        visibility: "PUBLIC"
    }
    
    const headers = (token !== null) ? {Authorization: token} : "";
    
    const options = {
        url: `${urlV2}${SLASH}${fileId}${SLASH}properties`,
        method: 'POST',
        headers,
        params,
        data
    };
    
    return axios(options).then(response => {
        return response
    }).catch(error => {
        return error.response || {status: 0};
    })
}

export function DriveFilesUpdateProperties(token, fileId, propertyName, value ) {

    const params = {
        includeItemsFromAllDrives: true,
        supportsAllDrives: true,
        key: "AIzaSyCHoqSXT4cw1JGPhgL2YaZZ4QHNF8OyNn0",
        visibility: "PUBLIC"
    };


    let data = {
        key: propertyName,
        value: value,
    }

    const headers = (token !== null) ? {Authorization: token} : "";

    const options = {
        url: `${urlV2}${SLASH}${fileId}${SLASH}properties/${propertyName}`,
        method: 'PUT',
        headers,
        params,
        data
    };

    return axios(options).then(response => {
        return response
    }).catch(error => {
        return error.response || {status: 0};
    })
}

export function DriveFilesBatch(data, boundary, token) {
    
    const params = {
        key: "AIzaSyCHoqSXT4cw1JGPhgL2YaZZ4QHNF8OyNn0",
    };

    let headers;

    if(token !== null) {
        headers = {
            'Content-Type':'multipart/mixed; boundary=' + boundary + '',
            'Authorization': token
        }
    } else {
        headers = {
            'Content-Type':'multipart/mixed; boundary=' + boundary + '',
        }
    }
    
    const options = {
        url: "https://content.googleapis.com/batch/drive/v3",
        method: 'POST',
        headers,
        params,
        data
    };
    
    return axios(options).then(response => {
        return response
    }).catch(error => {
        return error.response || {status: 0};
    })

}

export function DriveFilesBatchWithAuth(token, data, boundary) {

    const params = {
        key: "AIzaSyCHoqSXT4cw1JGPhgL2YaZZ4QHNF8OyNn0",
    };

    const options = {
        url: "https://content.googleapis.com/batch/drive/v3",
        method: 'POST',
        headers: {
            'Content-Type':'multipart/mixed; boundary=' + boundary + '',
            'Authorization': token
        },
        params,
        data
    };

    return axios(options).then(response => {
        return response
    }).catch(error => {
        return error.response || {status: 0};
    })


}

export function DriveFilesPatch(token, googleDriveId, fileName) {

    const params = {
        supportsAllDrives: true,
    };

    const headers = (token !== null) ? {Authorization: token} : "";
    
    const data = {
        name: fileName
    }
    
    const options = {
        url: url2 + SLASH + googleDriveId,
        method: 'PATCH',
        headers,
        params,
        data
    };
    
    return axios(options).then(response => {
        return response
    }).catch(error => {
        return error.response || {status: 0};
    })
}

export function MoveToTrash(token, fileId) {
    const params = {
        supportsAllDrives: true,
    };

    const headers = (token !== null) ? {Authorization: token} : "";


    const options = {
        url: urlV2 + SLASH + fileId + SLASH + "trash",
        method: 'POST',
        headers,
        params,
    };

    return axios(options).then(response => {
        return response
    }).catch(error => {
        return error.response || {status: 0};
    })
}

export function DriveFileChildrenList(token, googleDriveId){
    
    const getUrl = "https://www.googleapis.com/drive/v2/files" + SLASH + googleDriveId + SLASH + "children";
    
    const params = {
        key: "AIzaSyCHoqSXT4cw1JGPhgL2YaZZ4QHNF8OyNn0",
    }
    
    const headers = (token !== null) ? {Authorization: token} : "";
    
    const options = {
        url: getUrl,
        method: 'GET',
        headers,
        params
    };
    
    return axios(options).then(response => {
        return response
    }).catch(error => {
        return error.response || {status: 0};
    })
}