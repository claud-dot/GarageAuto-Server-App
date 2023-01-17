exports.tabToString = (tab)=>{
    var val = '';
    if(tab.length<=1) return tab[0];
    for (const string of tab) {
        val+=string+',';
    }
    return val.substring(0 , val.lastIndexOf(','));
}

exports.compareTwoElTab = (tabRef , tabBase)=>{
    let tab= []; 
    for (let index = 0; index < tabBase.length; index++) {
        tabBase[index] = tabBase[index]._id;
    }

    for (const el of tabRef) {
        if(tabBase.indexOf(el)==-1){
            tab.push(el);
        }
    }
    return tab;
}