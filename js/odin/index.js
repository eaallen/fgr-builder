import  ODIN  from "./odin";

const fgrStorage = new ODIN.AutoStorage("fgrs", {
    fgr_records: { settings: { storageType: ODIN.STORAGE_TYPE.LOCAL, defaultValue: {} } },
})



export {
    fgrStorage,
}