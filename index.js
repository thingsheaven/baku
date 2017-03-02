"use strict";

const Event = {created: Symbol('created'), deleted: Symbol('deleted'), updated:Symbol('updated')}
let EventEmiter = require('events')


class BakuDb extends EventEmiter {
    
    constructor(client, options){
        super()
        this.client = client
    }
    
    create(modelCls, kwargs){
        return new modelCls(this, kwargs || {})
    }
}

const consts = {DB_SYM:Symbol('db'), MASTER_SYM:Symbol('master')}
class BakuDbModel {
    constructor(db, kwargs){
        this[consts.DB_SYM] = db
        this.constructor.master.emit(Event.created, this)
    }
    
    destroy(options){
        this.constructor.emit(Event.deleted, this)
    }
    
    setValue(key, value){
        this.constructor.emit(Event.updated, this)
    }
    
    getValue(key){
        
    }
    
    get db() { return this[consts.DB_SYM] }

    get path() { return this.constructor.BASE_PATH }
    get meta() { return this._meta }
    
    save(){
        
    }
    
    get master(){
        return this.constructor.master
    }
    
    static get root(){
        return null
    }
    
    static get master(){
        let cached = this[consts.MASTER_SYM]
        if(cached) {
            return cached
        }
    
        console.log('%s creating new master', this.name)
    
        cached = new EventEmiter()
        if(this.root === null) {
            this[consts.MASTER_SYM] = cached
            console.log('%s: no root', this.name)
            return cached
        }
        
        let emitterRedirect = (event) => {
            cached.emit.apply(cached, arguments)
            //console.log('%s redirecting to root', this.name, arguments)
            this.root.emit.apply(this.root, arguments)
        }
        
        let eProxy = new Proxy(cached, {
            get: function(target, name) {
                //console.log('%s: proxy get', name)
                if (name === 'emit') return emitterRedirect
                return target[name]
            }
        })
        
        this[consts.MASTER_SYM] = eProxy
        cached.val = this.name
        return eProxy
    }
}

let util = require('util')
class User extends BakuDbModel {
    
    static get root(){
        return BakuDbModel.master
    }
    
}

if(!module.parent){
    
    console.log('hello node')
    let c = new BakuDb('CLIENT!!')
    
    // User.master.once(Event.created, ()=>{
    //     console.log('user created!')
    // })
    
    let m = c.create(User)
    console.log('M1:', User.master)
    //console.log('M2:', BakuDbModel.master.val)
    
    
    
    // let admin = require('firebase-admin')
    //
    // console.warn('firebase client is initialising in admin mode');
    // let app = admin.initializeApp({
    //     credential: admin.credential.cert(Path.join(__dirname, '/../serviceAccountKey.json')),
    //     databaseURL: 'https://web-domain-sellers.firebaseio.com'
    // });
}


