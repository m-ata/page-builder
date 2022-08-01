import React, {
    useContext,
    useEffect,
    useState,
} from 'react';
import {
    connect,
    useSelector
} from 'react-redux';
import styles from '../../../assets/jss/cloud-wiki/components/wikiNavMenu.style';
import {
    DriveFileIns,
    DriveFiles,
    DriveFilesBatch, DriveFilesBatchWithAuth, DriveFilesFindById,
    DriveFilesInsProperties,
    DriveFilesPatch, DriveFilesUpdateProperties, MoveToTrash
} from '../../../model/google/components/DriveFiles/DriveFiles';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import {listToTree} from '../../../state/utils/cloud-wiki/utils';
import TreeItem from '@material-ui/lab/TreeItem';
import {setToState} from '../../../state/actions';
import {useRouter} from 'next/router';
import LoadingSpinner from '../../LoadingSpinner';
import {
    DEFAULT_OREST_TOKEN,
    isErrorMsg
} from '../../../model/orest/constants';
import WebCmsGlobal from '../../webcms-global';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import SearchIcon from '@material-ui/icons/Search';
import FormControl from '@material-ui/core/FormControl';
import {makeStyles} from '@material-ui/core/styles';
import InputAdornment from '@material-ui/core/InputAdornment';
import MenuItem from '@material-ui/core/MenuItem';
import Dialog from '@material-ui/core/Dialog';
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Paper from '@material-ui/core/Paper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import FolderIcon from '@material-ui/icons/Folder';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import PopupState, {
    bindMenu,
    bindTrigger
} from 'material-ui-popup-state';
import Menu from '@material-ui/core/Menu';
import useNotifications from '../../../model/notification/useNotifications';
import useTranslation from '../../../lib/translations/hooks/useTranslation';
import {CustomToolTip} from "../../user-portal/components/CustomToolTip/CustomToolTip";
import { useSnackbar } from 'notistack';
import {LocaleContext} from "../../../lib/translations/context/LocaleContext";



const useStyles = makeStyles(styles);

function WikiNavMenu(props){
    const classes = useStyles();


    const { locale } = useContext(LocaleContext);
    const { showError } = useNotifications()
    const { t } = useTranslation();
    const { enqueueSnackbar } = useSnackbar();

    //REDUX
    const orestToken = useSelector((state) =>
        state.orest.currentUser !== null ? state.orest.currentUser.auth.access_token : DEFAULT_OREST_TOKEN
    );
    const currentUser = useSelector(state => state.orest.currentUser !== null ? state.orest.currentUser : null);
    const googleUser = useSelector(state => state.google !== null ? state.google : null);
    const { state, setToState } = props;
    
    // REACT HOOKS STATE
    const [googleToken, setGoogleToken] = useState(null);
    const [navMenuItems, setNavMenuItems] = useState([]);
    const [isNavMenuLoaded, setIsNavMenuLoaded] = useState(false);
    const [expanded, setExpanded] = useState([]);
    const [selected, setSelected] = useState([]);
    const [onlyDocs, setOnlyDocs] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [filterText, setFilterText] = useState('');
    const [openMenu, setOpenMenu] = useState(false);
    const [userHaveAuthorization, setUserHaveAuthorization] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [fileName, setFileName] = useState("");
    const [fileType, setFileType] = useState("");
    const [fileId, setFileId] = useState("");
    const [parentId, setParentId] = useState("");
    const [batchData, setBatchData] = useState("");
    const [isAdd, setIsAdd] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [mainFolderList, setMainFolderList] = useState([]);
    const [rootFolderList, setRootFolderList] = useState([]);
    const [arrayIndex, setArrayIndex] = useState(0);
    const [parentFolderLength, setParentFolderLength] = useState(0);
    const [selectedMainFolder, setSelectedMainFolder] = useState("");
    const router = useRouter();
    const [openOrderDialog, setOpenOrderDialog] = useState(false);
    const [itemToOrder, setItemToOrder] = useState(null);
    const [orderValue, setOrderValue] = useState("");
    const [pop, setPop] = useState(null);
    
    const fileTypes = {
        document: "application/vnd.google-apps.document",
        folder: "application/vnd.google-apps.folder",
        shortcut: "application/vnd.google-apps.shortcut"
    }

    const fields = "nextPageToken,files(properties,id,name,parents,explicitlyTrashed,mimeType,shortcutDetails,permissions(id,displayName,emailAddress,role),lastModifyingUser,webContentLink,webViewLink,ownedByMe,teamDriveId,driveId,iconLink,thumbnailLink,imageMediaMetadata/width,imageMediaMetadata/height,capabilities/canAddChildren,modifiedTime)"


    const mainFolderListId = [
        "17HT0jF-BPXGOGQY4Gy_2s4PWhZscuidC",
        "1xiBHqbohC3Xxw-mpUn2TcBUGvkzK7BhV",
        "1iFHGgMTRNUrIqzJD4jKtf1Kukbjnn3Ce"
    ]

    let isLangChange = false
    if (state.langCode !== locale) {
        isLangChange = true
        setToState('cloudWiki', ['langCode'], locale)
    }


    const searchDoc = (event) => {
        setFilterText(event.target.value);
        setFilteredData(onlyDocs.filter((s) => {
            return s.name.toLowerCase()
                .indexOf(event.target.value.toLowerCase()) !== -1;
        }));
    }

    const handleSelectChange = (event) => {
        setSelectedMainFolder(event.target.value);
        setNavMenuItems([]);
        setOnlyDocs([]);
        setIsNavMenuLoaded(false);
        router.push({
            pathname: `/userdoc`,
            query: {q: event.target.value, lang: locale}
        })
        setToState('cloudWiki', ['googleDocId'], "home");
    }
    
    const handleClick = () => {
        setOpenMenu(true);
    };
    
    const handleClose = () => {
        setOpenMenu(false);
    };
    
    const goToDoc = (treeItemData) => {
        if(treeItemData.mimeType === fileTypes.shortcut) {
            if(treeItemData.shortcutDetails.targetMimeType !== fileTypes.folder) {
                setToState('cloudWiki', ['googleDocId'], treeItemData.id);
                router.push({
                    pathname: `/userdoc`,
                    query: {page: treeItemData.id, q: router.query.q, lang: locale}
                });
            }
        } else if (treeItemData.mimeType !== fileTypes.folder) {
            setToState('cloudWiki', ['googleDocId'], treeItemData.id);
            router.push({
                pathname: `/userdoc`,
                query: {page: treeItemData.id, q: router.query.q, lang: locale}
            });
        }

    }
    
    const handleMenuItemClick = (docId) => {
        handleClose();
        setFilterText("");
        setToState('cloudWiki', ['googleDocId'], docId );
        router.push({
            pathname: `/userdoc`,
            query: {page: docId, q: router.query.q, lang: locale}
        });
    }

    useEffect(() => {
        if(isLangChange) {
            let id = "";

            if(locale === "en") {
                id = mainFolderListId[0];
            } else if(locale === "es") {
                id = mainFolderListId[1];
            } else if(locale === "tr") {
                id = mainFolderListId[2];
            }

            const query = `'${id}' in parents`;
            DriveFiles(googleToken, query).then(res => {
                if(res.status === 200) {
                    if(res.data.files.length > 0) {
                        let array = [];
                        res.data.files.map((item,i) => {
                            const data = {
                                id: item.id,
                                name: item.name,
                                mimeType: item.mimeType,
                                index: item.properties ? item.properties.index : res.data.files.length,
                                properties: item.properties ? item.properties : null
                            };
                            array.push(data);
                        })
                        array.sort((a,b) => a.index - b.index)
                        setMainFolderList(array);
                        if(!state.langCode) {
                            if(!router.query.q) {
                                router.push({
                                    pathname: "/userdoc",
                                    query: {q: array[0].id, lang: locale}
                                })
                                setSelectedMainFolder(array[0].id);
                            } else {
                                setSelectedMainFolder(router.query.q);
                            }
                        } else {
                            router.push({
                                pathname: "/userdoc",
                                query: {q: array[0].id, lang: locale}
                            })
                            setIsNavMenuLoaded(false);
                            setSelectedMainFolder(array[0].id);
                        }

                    }
                }
            })
        }
    }, [locale])

    useEffect(() => {
        let token = null;
        let tokenType;
        if(selectedMainFolder !== "") {
            if(googleUser.currentUser) {
                tokenType = googleUser.currentUser?.auth?.token_type;
                token = tokenType + " " + googleUser.currentUser.auth?.access_token;
                setGoogleToken(token);
                DriveFilesFindById(token, selectedMainFolder).then(res => {
                    if(res.status === 200) {
                        const capabilities = res.data.capabilities
                        if(capabilities.canAddChildren && capabilities.canModifyContent && capabilities.canEdit) {
                            setUserHaveAuthorization(true);
                        } else {
                            setUserHaveAuthorization(false);
                        }

                    }
                })
            } else {
                setUserHaveAuthorization(false)
            }
        }

    }, [selectedMainFolder, googleUser.currentUser])

    useEffect(() => {
        let tempItemArray = [];
        let tempOnlyDocArray = [];
        let rootTempArray = [];
        let tempBatchData = "";

        const query = `'${selectedMainFolder}' in parents`;
        const boundary = 'batch3216574897432165';
        const delimeter = "\r\n--"+ boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";

        if(selectedMainFolder !== "") {
            DriveFiles(googleToken, query).then(res => {
                if(res.status === 200) {
                    if(res.data.files.length > 0) {
                        res.data.files.map((item, ind) => {
                            const data = {
                                id: item.id,
                                parentId: "0",
                                originalParentId: item.parents[0],
                                name: item.name,
                                mimeType: item.mimeType,
                                shortcutDetails: item.shortcutDetails ? item.shortcutDetails : "",
                                index: item.properties ? item.properties.index : res.data.files.length,
                            };

                            if(data.parentId === "0") {
                                rootTempArray.push(data);
                            }

                            tempItemArray.push(data);

                            if (item.mimeType !== fileTypes.folder) {
                                tempOnlyDocArray.push(data);
                            }

                            if (item.mimeType === fileTypes.folder) {
                                tempBatchData = (
                                    tempBatchData +
                                    delimeter +
                                    'Content-Type: application/http\n' +
                                    'Content-Transfer-Encoding: binary\r\n\r\n' +
                                    "GET /drive/v3/files?q=('"+ item.id + "'%20in%20parents)%20and%20trashed%20=%20false&key=AIzaSyCHoqSXT4cw1JGPhgL2YaZZ4QHNF8OyNn0&includeItemsFromAllDrives=true&supportsAllDrives=true&fields=" + fields + "\n"+
                                    "Content-Type: application/json; charset=UTF-8\n"
                                )
                            }

                        })

                        setNavMenuItems(tempItemArray.sort((a,b) => a.index - b.index));
                        setRootFolderList(rootTempArray.sort((a,b) => a.index - b.index));
                        setOnlyDocs(tempOnlyDocArray);

                        if(tempBatchData === "") {
                            setIsNavMenuLoaded(true)
                        } else {
                            tempBatchData = tempBatchData + close_delim;
                            setBatchData(tempBatchData);
                        }

                    } else {
                        setNavMenuItems(res.data.files);
                        setIsNavMenuLoaded(true);
                    }
                }
            })
        }
    },[selectedMainFolder])

    useEffect(() => {
        if(isNavMenuLoaded) {
            if(router.query.page) {
                let file = navMenuItems.find(e => e.id === router.query.page);

                if(file) {
                    setSelected(file.id);

                    while(file.parentId !== "0") {
                        file = navMenuItems.find(e => e.id === file.parentId)
                        expanded.push(file.id)
                    }
                }
            }
        }
    },[isNavMenuLoaded, router.query.page])


    useEffect(() => {
        if(batchData) {
            let tempBatchData = "";
            const boundary = 'batch3216574897432165';
            const delimeter = "\r\n--"+ boundary + "\r\n";
            const close_delim = "\r\n--" + boundary + "--";
            DriveFilesBatch(batchData, boundary, null).then(res => {
                if(res.status === 200) {
                    const temp = res.data.split("--batch");
                    const parsedValue = temp.slice(1, temp.length - 1).map(function(e){return JSON.parse(e.match(/{[\S\s]+}/g)[0])});
                    parsedValue.map((item) => {
                        if(item.files && item.files.length > 0) {
                            item.files.map((item2) => {
                                const data = {
                                    id: item2.id,
                                    parentId: item2.parents[0],
                                    name: item2.name,
                                    mimeType: item2.mimeType,
                                    shortcutDetails: item2.shortcutDetails ? item2.shortcutDetails : "",
                                    index: item2.properties ? item2.properties.index : '0',
                                };

                                navMenuItems.push(data);

                                navMenuItems.sort((a,b) => a.index - b.index)

                                if (item2.mimeType !== fileTypes.folder) {
                                    onlyDocs.push(data);
                                }

                                if (item2.mimeType === fileTypes.folder) {
                                    tempBatchData = (
                                        tempBatchData +
                                        delimeter +
                                        'Content-Type: application/http\n' +
                                        'Content-Transfer-Encoding: binary\r\n\r\n' +
                                        "GET /drive/v3/files?q=('"+ item2.id + "'%20in%20parents)%20and%20trashed%20=%20false&key=AIzaSyCHoqSXT4cw1JGPhgL2YaZZ4QHNF8OyNn0&includeItemsFromAllDrives=true&supportsAllDrives=true&fields=nextPageToken,files(properties,id,name,parents,explicitlyTrashed,mimeType,permissions(id,displayName,emailAddress,role),lastModifyingUser,webContentLink,webViewLink,ownedByMe,teamDriveId,driveId,iconLink,thumbnailLink,imageMediaMetadata/width,imageMediaMetadata/height,capabilities/canAddChildren,modifiedTime)\n"+
                                        "Content-Type: application/json; charset=UTF-8\n"
                                    )
                                }
                            });
                        }
                    })
                    if(tempBatchData !== "") {
                        tempBatchData = tempBatchData + close_delim;
                    }
                    setBatchData(tempBatchData);
                    if(tempBatchData === "") {
                        setIsNavMenuLoaded(true);
                    }

                }
            })
        }
    },[batchData])

    
    const handleSave = () => {
        if(isAdd) {
            if(fileName !== "") {
                if(fileType !== "" && parentId !== "") {
                    const query = `'${parentId}' in parents`;
                    DriveFiles(googleToken, query). then(res => {
                        if(res.status === 200) {
                            const fileIndex = res.data.files.length ? res.data.files.length : 0;
                            if(fileIndex >= 0){
                                DriveFileIns(googleToken, fileName, fileType, parentId).then(r1 => {
                                    if (r1.status === 200){
                                        const createdFileId = r1.data.id;
                                        const createdFileName = r1.data.name;
                                        DriveFilesInsProperties(googleToken, createdFileId, "menuParent", parentId)
                                            .then(r2 => {
                                                if (r2.status === 200){}
                                            });
                                        DriveFilesInsProperties(googleToken, createdFileId, "index", fileIndex)
                                            .then(r2 => {
                                                if (r2.status === 200){
                                                    const data = {
                                                        id: createdFileId,
                                                        parentId: parentId,
                                                        name: createdFileName,
                                                        mimeType: fileType,
                                                        index: fileIndex,
                                                    }
                    
                                                    navMenuItems.push(data);
                                                    setOpenDialog(false);
                                                }
                                            })
                                    } else {
                                        const retErr = isErrorMsg(r1)
                                        showError(retErr.errorMsg)
                                    }
                                })
                            }
                        }
                    })
                }
            } else {
                showError(t("str_fieldCannotBeEmpty"))
                console.log("hata");
            }
        } else if(isEdit) {
            if(fileId) {
                DriveFilesPatch(googleToken, fileId, fileName).then(res => {
                    if(res.status === 200) {
                        let value = [...navMenuItems];
                        const selectedDoc = navMenuItems.find(e => e.id === fileId)
                        const selectedDocIndex = navMenuItems.findIndex(e => e.id === fileId)
                        value[selectedDocIndex] = {
                            id: selectedDoc.id,
                            parentId: selectedDoc.parentId,
                            name: res.data.name,
                            mimeType: selectedDoc.mimeType,
                            index: selectedDoc.index,
                        }
                        setNavMenuItems(value);
                        setOpenDialog(false);
                        pop.close();
                    } else {
                        const retErr = isErrorMsg(res)
                        showError(retErr.errorMsg)
                    }
                })

            }
        }
    }


    const handlePatchWithBatch = (action, popupState, file) => {
        setIsNavMenuLoaded(false);
        let tempBatchData = "";
        const boundary = 'batch3216474897982165';
        const delimeter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";
        let parentFolder;
        let downFileIndex;
        let upFile;
        let upFileIndex;
        let value = [...navMenuItems];
        let rootValue = [...rootFolderList];

        if(action === "up") {
            if(file.parentId !== "0") {
                parentFolder = navMenuItems.find(e => e.id === file.parentId);
                downFileIndex = parentFolder.children.findIndex(e => e.id === file.id);
                upFile = parentFolder.children[parseInt(downFileIndex) - 1];
                upFileIndex = downFileIndex - 1;
            } else {
                parentFolder = rootValue.sort((a,b) => a.index - b.index);
                downFileIndex = parentFolder.findIndex(e => e.id === file.id);
                upFile = parentFolder[parseInt(downFileIndex) - 1];
                upFileIndex = downFileIndex - 1;
            }
        } else if(action === "down") {
            if(file.parentId !== "0") {
                parentFolder = navMenuItems.find(e => e.id === file.parentId);
                downFileIndex = parentFolder.children.findIndex(e => e.id === file.id);
                upFile = parentFolder.children[parseInt(downFileIndex + 1 )];
                upFileIndex = downFileIndex + 1;
            } else {
                parentFolder = rootValue.sort((a,b) => a.index - b.index);
                downFileIndex = parentFolder.findIndex(e => e.id === file.id);
                upFile = parentFolder[parseInt(downFileIndex + 1 )];
                upFileIndex = downFileIndex + 1;
            }
        }

        const downFileData = {
            properties: {
                index: upFileIndex.toString()
            }
        }
        const  upFileData = {
            properties: {
                index: downFileIndex.toString()
            }
        }

        tempBatchData = (
            tempBatchData +
            delimeter +
            'Content-Type: application/http\n' +
            'Content-Transfer-Encoding: binary\r\n\r\n' +
            "PATCH /drive/v3/files/" + file.id +"?key=AIzaSyCHoqSXT4cw1JGPhgL2YaZZ4QHNF8OyNn0&includeItemsFromAllDrives=true&supportsAllDrives=true&fields=*\n" +
            "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
            JSON.stringify(downFileData) +
            delimeter +
            'Content-Type: application/http\n' +
            'Content-Transfer-Encoding: binary\r\n\r\n' +
            "PATCH /drive/v3/files/" + upFile.id +"?key=AIzaSyCHoqSXT4cw1JGPhgL2YaZZ4QHNF8OyNn0&includeItemsFromAllDrives=true&supportsAllDrives=true&fields=*\r\n" +
            "Content-Type: application/json; charset=UTF-8\n\n" +
            JSON.stringify(upFileData) +
            close_delim
        )


        DriveFilesBatchWithAuth(googleToken,tempBatchData, boundary).then(res => {
            if(res.status === 200) {
                setIsNavMenuLoaded(true);
                if(file.parentId === "0") {

                    rootValue[rootValue.findIndex(e => e.id === file.id)] = {
                        id: file.id,
                        parentId: file.parentId,
                        name: file.name,
                        mimeType: file.mimeType,
                        index: upFileIndex.toString(),

                    }

                    rootValue[rootValue.findIndex(e => e.id === upFile.id)] = {
                        id: upFile.id,
                        parentId: upFile.parentId,
                        name: upFile.name,
                        mimeType: upFile.mimeType,
                        index: downFileIndex.toString(),
                    }
                }

                value[value.findIndex(e => e.id === file.id)] = {
                    id: file.id,
                    parentId: file.parentId,
                    name: file.name,
                    mimeType: file.mimeType,
                    index: upFileIndex.toString(),

                }
                value[value.findIndex(e => e.id === upFile.id)] = {
                    id: upFile.id,
                    parentId: upFile.parentId,
                    name: upFile.name,
                    mimeType: upFile.mimeType,
                    index: downFileIndex.toString(),
                }

                setNavMenuItems(value.sort((a,b) => a.index - b.index));
                setRootFolderList(rootValue.sort((a,b) => a.index - b.index));
                popupState.close();
            } else {
                setIsNavMenuLoaded(true);
            }
        })

    }

    const handleMoveToTrash = (treeItemData) => {
        setIsNavMenuLoaded(false);
        MoveToTrash(googleToken, treeItemData.id).then(res => {
            if(res.status === 200) {
                if(treeItemData.mimeType === fileTypes.folder) {
                    const prevNavMenuItems = [...navMenuItems];
                    const fileIndex = prevNavMenuItems.findIndex(e => e.id === treeItemData.id);
                    const trashFileList = prevNavMenuItems.filter(e => e.parentId === treeItemData.id);
                    if(trashFileList.length > 0) {
                        prevNavMenuItems.splice(fileIndex, 1);
                        trashFileList.map((item) => {
                            const index = prevNavMenuItems.findIndex(e => e.id === item.id);
                            prevNavMenuItems.splice(index, 1);
                        })
                    } else {
                        prevNavMenuItems.splice(fileIndex, 1);
                    }
                    setNavMenuItems(prevNavMenuItems)

                } else {
                    const prevNavMenuItems = [...navMenuItems];
                    const fileIndex = prevNavMenuItems.findIndex(e => e.id === treeItemData.id);
                    prevNavMenuItems.splice(fileIndex, 1);
                    setNavMenuItems(prevNavMenuItems)

                }
                setIsNavMenuLoaded(true);
            } else {
                showError("Error! Try again later");
                setIsNavMenuLoaded(true);
            }
        })
    }

    const findArrayIndex = (event, popupState, file) => {
        popupState.open(event);
        let parentFolder;
        let rootValue = [...rootFolderList];
        if(file.parentId !== "0") {
            parentFolder = navMenuItems.find(e => e.id === file.parentId);
            setParentFolderLength(parentFolder.children.length);
            setArrayIndex(parentFolder.children.findIndex(e => e.id === file.id));
            console.log(parentFolder.children.findIndex(e => e.id === file.id))
        } else {
            parentFolder = rootValue.sort((a,b) => a.index - b.index);
            setArrayIndex(parentFolder.findIndex(e => e.id === file.id));
            console.log(parentFolder.findIndex(e => e.id === file.id))
        }
    }

    const handleOrderMainFolderList = () => {
        const value = [...mainFolderList];
        const index = mainFolderList.findIndex(e => e.id === itemToOrder.id);
        value[index].index = orderValue.toString();
        setMainFolderList(value.sort((a,b) => a.index - b.index));
    }

    const handleChangeMenuOrder = () => {
        if(orderValue !== "") {
            if(itemToOrder) {
                setIsNavMenuLoaded(false);
                if(itemToOrder.properties && itemToOrder.properties.index) {
                    DriveFilesUpdateProperties(googleToken, itemToOrder.id, "index", orderValue).then(res => {
                        if(res.status === 200) {
                            handleOrderMainFolderList();
                            enqueueSnackbar("Success", { variant: 'success' })
                            setIsNavMenuLoaded(true);
                            setOpenOrderDialog(false);
                            setOrderValue("");
                        } else {
                            enqueueSnackbar("Try again later", { variant: 'error' })
                            setIsNavMenuLoaded(true);
                        }
                    })
                } else {
                    DriveFilesInsProperties(googleToken, itemToOrder.id, "index", orderValue).then(res => {
                        if(res.status === 200) {
                            handleOrderMainFolderList();
                            enqueueSnackbar("Success", { variant: 'success' })
                            setIsNavMenuLoaded(true);
                            setOpenOrderDialog(false);
                            setOrderValue("");
                        } else {
                            enqueueSnackbar("Try again later", { variant: 'error' });
                            setIsNavMenuLoaded(true);
                        }
                    })
                }
            } else {
                enqueueSnackbar("Item is null", { variant: 'error' })
            }
        } else {
            enqueueSnackbar("Please enter a value", { variant: 'error' })
        }

    }
    
    const handleReset = () => {
        setFileType("");
        setFileName("");
        setOpenDialog(false);
        setIsEdit(false);
        setIsAdd(false);
    }
    
    const handleSelect = (event, nodeIds) => {
        setSelected(nodeIds);
    };
    
    const handleChange = (event, nodes) => {
        setExpanded(nodes);
    };
    
    const handleOpenAddMenuDialog = (event, parentId) => {
        setIsAdd(true);
        setParentId(parentId);
        if(event.target.value === 0) {
            setFileType(fileTypes.document)
        } else if(event.target.value === 1) {
            setFileType(fileTypes.folder)
        }
        setOpenDialog(true);
    }
    
    const handleOpenEditMenuDialog = (event, fileId, fileName, popupState) => {
        setIsEdit(true);
        setFileId(fileId);
        setOpenDialog(true);
        setFileName(fileName);
        setPop(popupState);
    }
    
    const handleCloseDialog = () => {
        setOpenDialog(false);
        
    }

    const handleOpenOrderMenu = () => {
        setItemToOrder(mainFolderList.find(e => e.id === selectedMainFolder));
        setOpenOrderDialog(true);
    }
    
    const getTreeItemsFromData = treeItems => {
        return treeItems.map(treeItemData => {
            let children = undefined;
            if (treeItemData.children && treeItemData.children.length > 0) {
                children = getTreeItemsFromData(treeItemData.children);
            }
            if(treeItemData.mimeType === fileTypes.folder) {
                return (
                    <div className={classes.treeItemDiv}>
                        <TreeItem
                            key={treeItemData.id}
                            nodeId={treeItemData.id}
                            onClick={() => goToDoc(treeItemData)}
                            label={
                                <div className={classes.treeItemLabelRoot}>
                                    {treeItemData.mimeType === fileTypes.shortcut && currentUser.loginfo.hotelrefno === 999999 && googleUser  ?
                                        <div style={{display: "contents"}}>
                                            <CustomToolTip title={"Shortcut"} placement={"top"}>
                                                <Avatar style={{width: "20px", height: "20px" }}>S</Avatar>
                                            </CustomToolTip>
                                            <Typography style={{paddingLeft: "8px"}}>{treeItemData.name}</Typography>
                                        </div>
                                        :
                                        <>
                                            {treeItemData.name}
                                        </>
                                    }
                                </div>
                            }
                            children={children}
                        />
                        {
                            userHaveAuthorization ? (
                                <div className={classes.treeItemLabelAction}>
                                    <PopupState variant="popover" popupId="add-menu">
                                        {(popupState) => (
                                            <React.Fragment>
                                                <IconButton
                                                    className={classes.treeItemActionButton}
                                                    {...bindTrigger(popupState)}
                                                >
                                                    <AddIcon color="inherit" className={classes.labelIcon} />
                                                </IconButton>
                                                <Menu
                                                    {...bindMenu(popupState)}
                                                    getContentAnchorEl={null}
                                                    anchorOrigin={{
                                                        vertical: "bottom",
                                                        horizontal: "left"
                                                    }}
                                                    transformOrigin={{
                                                        vertical: "top",
                                                        horizontal: "left"
                                                    }}
                                                >
                                                    <MenuItem value={0} onClick={(e) => handleOpenAddMenuDialog(e, treeItemData.id)}><InsertDriveFileIcon /> Add Document</MenuItem>
                                                    <MenuItem value={1} onClick={(e) => handleOpenAddMenuDialog(e, treeItemData.id)}><FolderIcon /> Add Folder</MenuItem>
                                                </Menu>
                                            </React.Fragment>
                                        )}
                                    </PopupState>
                                    <PopupState variant="popover" popupId="edit-menu">
                                        {(popupState) => (
                                            <React.Fragment>
                                                <IconButton
                                                    className={classes.treeItemActionButton}
                                                    onClick={(e) => findArrayIndex(e, popupState, treeItemData)}
                                                >
                                                    <MoreHorizIcon color="inherit" className={classes.labelIcon} />
                                                </IconButton>
                                                <Menu
                                                    {...bindMenu(popupState)}
                                                    getContentAnchorEl={null}
                                                    anchorOrigin={{
                                                        vertical: "bottom",
                                                        horizontal: "left"
                                                    }}
                                                    transformOrigin={{
                                                        vertical: "top",
                                                        horizontal: "left"
                                                    }}
                                                >

                                                    <MenuItem onClick={(e) => handleOpenEditMenuDialog(e, treeItemData.id, treeItemData.name, popupState)}><EditIcon /> Rename</MenuItem>
                                                    {arrayIndex !== 0 ?  <MenuItem onClick={() => handlePatchWithBatch("up", popupState,treeItemData)}><ArrowUpwardIcon /> Move Up</MenuItem> : null}
                                                    {
                                                        treeItemData.parentId === "0" ?
                                                            arrayIndex + 1 < rootFolderList.length ?
                                                                <MenuItem onClick={() => handlePatchWithBatch("down", popupState,treeItemData)}><ArrowDownwardIcon /> Move Down</MenuItem>
                                                                : null
                                                            :
                                                            arrayIndex + 1 < parentFolderLength ?
                                                                <MenuItem onClick={() => handlePatchWithBatch("down", popupState,treeItemData)}><ArrowDownwardIcon /> Move Down</MenuItem>
                                                                : null
                                                    }
                                                    {/*<MenuItem onClick={(e) => handleMoveToTrash(treeItemData)}><DeleteIcon /> Move To Trash</MenuItem> */}
                                                </Menu>
                                            </React.Fragment>
                                        )}
                                    </PopupState>
                                </div>
                            ) : null
                        }
                    </div>
                );
            } else {
                return (
                    <div className={classes.treeItemDiv}>
                        <TreeItem
                            key={treeItemData.id}
                            nodeId={treeItemData.id}
                            onClick={() => goToDoc(treeItemData)}
                            label={
                                <div className={classes.treeItemLabelRoot}>
                                    {treeItemData.mimeType === fileTypes.shortcut && currentUser && currentUser.loginfo.hotelrefno === 999999 && googleUser ?
                                        <div style={{display: "contents"}}>
                                            <CustomToolTip title={"Shortcut"} placement={"top"}>
                                                <Avatar style={{width: "20px", height: "20px" }}>S</Avatar>
                                            </CustomToolTip>
                                            <Typography style={{paddingLeft: "8px"}}>{treeItemData.name}</Typography>
                                        </div>
                                        :
                                        <>
                                            {treeItemData.name}
                                        </>
                                    }
                                </div>
                            }
                            children={children}
                        />
                        {
                            userHaveAuthorization ? (
                                <div className={classes.treeItemLabelAction}>
                                    <PopupState variant="popover" popupId="edit-menu2">
                                        {(popupState) => (
                                            <React.Fragment>
                                                <IconButton
                                                    className={classes.treeItemActionButton}
                                                    onClick={(e) => findArrayIndex(e, popupState, treeItemData)}
                                                >
                                                    <MoreHorizIcon color="inherit" className={classes.labelIcon} />
                                                </IconButton>
                                                <Menu
                                                    {...bindMenu(popupState)}
                                                    getContentAnchorEl={null}
                                                    anchorOrigin={{
                                                        vertical: "bottom",
                                                        horizontal: "left"
                                                    }}
                                                    transformOrigin={{
                                                        vertical: "top",
                                                        horizontal: "left"
                                                    }}
                                                >

                                                    <MenuItem onClick={(e) => handleOpenEditMenuDialog(e, treeItemData.id, treeItemData.name, popupState)}><EditIcon /> Rename</MenuItem>
                                                    {arrayIndex !== 0 ? <MenuItem onClick={() => handlePatchWithBatch("up", popupState,treeItemData)}><ArrowUpwardIcon /> Move Up</MenuItem> : null}
                                                    {
                                                        treeItemData.parentId === "0" ?
                                                            arrayIndex + 1 < rootFolderList.length ?
                                                                <MenuItem onClick={() => handlePatchWithBatch("down", popupState,treeItemData)}><ArrowDownwardIcon /> Move Down</MenuItem>
                                                                : null
                                                            :
                                                            arrayIndex + 1 < parentFolderLength ?
                                                                <MenuItem onClick={() => handlePatchWithBatch("down", popupState,treeItemData)}><ArrowDownwardIcon /> Move Down</MenuItem>
                                                                : null
                                                    }
                                                    {/*<MenuItem onClick={() => handleMoveToTrash(treeItemData)}><DeleteIcon /> Move To Trash</MenuItem>*/}
                                                </Menu>
                                            </React.Fragment>
                                        )}
                                    </PopupState>
                                </div>
                            ) : null
                        }
                    </div>
                );
            }
            
        });
    };

    
    if(!isNavMenuLoaded) {
        return (
            <LoadingSpinner />
        )
    }
    
    return(
        <div>
            <Dialog
                open={openOrderDialog}
                fullWidth
                maxWidth={"xs"}
                onClose={() => setOpenOrderDialog(false)}
            >
                <div style={{padding: "16px"}}>
                    {
                        itemToOrder ?
                            <React.Fragment>
                                <Typography style={{textAlign: "center", fontSize: "24px", fontWeight: "bold"}}>Set Menu Order</Typography>
                                <Typography style={{paddingTop: "16px", fontWeight: "bold"}}>Order Will Change Item:  <a style={{fontWeight: "500"}}>{itemToOrder.name}</a></Typography>
                                <Typography style={{paddingTop: "8px", paddingBottom: "8px", fontWeight: "bold"}}>Current Menu Order: <a style={{fontWeight: "500"}}>{itemToOrder.properties && itemToOrder.properties.index ? itemToOrder.properties.index : "Not yet defined"}</a></Typography>
                                <TextField
                                    value={orderValue}
                                    onChange={(e) => setOrderValue(e.target.value)}
                                    className={classes.textFieldStyle}
                                    fullWidth
                                    variant={"outlined"}
                                />
                                <div style={{paddingTop: "16px", textAlign: "right"}}>
                                    <Button onClick={() => {
                                        setOpenOrderDialog(false);
                                        setOrderValue("");
                                    }}
                                    >
                                        {t("str_cancel")}
                                    </Button>
                                    <Button
                                        onClick={handleChangeMenuOrder}
                                        className={classes.saveButton}
                                        variant="contained"
                                    >
                                        {t("str_save")}
                                    </Button>
                                </div>
                            </React.Fragment>
                        : null
                    }
                </div>
            </Dialog>
            <Dialog
                open={openDialog}
                fullWidth
                onClose={handleCloseDialog}
                maxWidth={'xs'}
            >
                <div className={classes.addDialog}>
                    {
                        isAdd ? (
                            <Typography style={{paddingBottom: "8px"}}>
                                {
                                    fileType === fileTypes.document ?
                                        "Document Name" : "Folder Name"
                                }
                            </Typography>
                        ) : isEdit ? (
                            <Typography style={{paddingBottom: "8px"}}>
                                Rename
                            </Typography>
                        ) : null
                    }
                    <TextField
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        classes={{root:classes.textFieldStyle}}
                        fullWidth
                        InputLabelProps={{shrink: false}}
                        variant="outlined"
                    />
                    <div style={{paddingTop: "16px",float: "right"}}>
                        <Button onClick={() => handleReset()}>{t("str_cancel")}</Button>
                        <Button
                            className={classes.saveButton}
                            variant="contained"
                            disabled={fileName === ""}
                            onClick={handleSave}
                        >
                            {t("str_save")}
                        </Button>
                    </div>
            </div>
            </Dialog>
            <div style={{display: "flex"}}>
                <FormControl className={classes.formControl}>
                    <Select
                        value={selectedMainFolder}
                        variant={"outlined"}
                        onChange={handleSelectChange}
                        MenuProps={{
                            classes: {
                                paper: classes.selectStyle,
                            },
                            anchorOrigin: {
                                vertical: "bottom",
                                horizontal: "left"
                            },
                            transformOrigin: {
                                vertical: "top",
                                horizontal: "left"
                            },
                            getContentAnchorEl: null
                        }}
                    >
                        {
                            mainFolderList.map((item) => (
                                <MenuItem key={`menu-item-${item.id}`} value={item.id}>{item.name}</MenuItem>
                            ))
                        }
                    </Select>
                </FormControl>
                {
                    userHaveAuthorization ?
                        <CustomToolTip title={"Set Menu Order"}>
                            <IconButton onClick={() => handleOpenOrderMenu()}><MoreVertIcon style={{color: "#FFF"}}/></IconButton>
                        </CustomToolTip> : null
                }
            </div>
            <div style={{paddingBottom:"16px"}}/>
            <ClickAwayListener onClickAway={handleClose}>
            <FormControl className={classes.formControl} onClick={handleClick}>
                <TextField
                    value={filterText}
                    onChange={searchDoc}
                    classes={{root:classes.textFieldStyle}}
                    fullWidth
                    InputLabelProps={{shrink: false}}
                    variant="outlined"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}/>
            </FormControl>
        </ClickAwayListener>
            <Paper
                className={openMenu && filterText.length > 0 ? classes.paperMenuOpen : classes.paperMenuClose}
            >
                {
                    filteredData.map((item,ind) => {
                        return(
                            <MenuItem key={ind} value={item.id} onClick={ () => handleMenuItemClick(item.id)}>{item.name}</MenuItem>
                        )
                    })
                }
            </Paper>
            <div style={{paddingTop:"16px"}}/>
            <TreeView
                className={classes.treeItemRoot}
                defaultCollapseIcon={<ExpandMoreIcon/>}
                defaultExpandIcon={<ChevronRightIcon/>}
                expanded={expanded}
                selected={selected}
                onNodeSelect={handleSelect}
                onNodeToggle={handleChange}
            >
                {getTreeItemsFromData(listToTree(navMenuItems))}
            </TreeView>
        </div>
       
    );
    
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
    pushToState: (stateType, stateName, value) => dispatch(pushToState(stateType, stateName, value)),
})

const mapStateToProps = state => {
    return {
        state: state.formReducer.cloudWiki,
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(WikiNavMenu)