var fs = require ("fs")

var path = 'build/wechatgame/res'

var includesFiles = [
    "14e864d4e",
    "13857eb10",
    "11aa46fea",
    "18d334441",
    "162f26dd6",
    "1377398a1",
]

var excludesFiles = [
    // c1aad502-e2ed-43c6-b8da-5e7d23e5a502.8ff42.mp3
    "c1aad502-e2ed-43c6-b8da-5e7d23e5a502",
    "860d114a-55dc-4a23-ac09-bced34e5f094",
    "2f866cdb-b059-4aff-a069-2a6d5e8b1fa5"
]

var includeExts = [
    ".mp3"
]

// 删除文件 
// fs.unlinkSync(xx,)


function readDirSync(path){
	var pa = fs.readdirSync(path);
	pa.forEach(function(ele,index){
		var info = fs.statSync(path+"/"+ele)	
		if(info.isDirectory()){
			// cc.log("dir: "+ele)
			readDirSync(path+"/"+ele);
		}else{
            let filepath = (`${path}/${ele}`)
            if(includesFiles.some(v=>filepath.includes(v))){
                cc.log("exclude file:" + filepath)
            }else{
                if(includeExts.some(v=>filepath.endsWith(v))){
                    if(excludesFiles.some(v=>filepath.includes(v))){
                        fs.unlinkSync(filepath);
                    }else
                        cc.log("exclude exntension:" + filepath)
                }else{
                    fs.unlinkSync(filepath);
                }
            }
		}	
	})
}

readDirSync(path);