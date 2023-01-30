const objectID = require('mongodb').ObjectId;
let months = ['Janvier' , 'Février' ,'Mars' , 'Avril' , 'Mai' ,'Juin' ,'Juillet' , 'Aôut' , 'Septembre' , 'Octobre' , 'Novembre' , 'Décembre'];

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

exports.durationRepair = (invoices , res)=>{
    let durations = [];
    try {
        for (const invoice of invoices) {
            durations.push(convertInDay(invoice.duration, invoice.unit_duration));
        }
        return durations;
    } catch (error) {
        console.log(error);
        res.status(500).send({ message : error });
        return;
    }
}

function convertInDay(duration , unit){
    if(unit.toLowerCase().includes('jour')){
        return duration;
    }else if(unit.toLowerCase().includes('semaine')){
        return (duration * 7);
    }else if(unit.toLowerCase().includes('mois')){
        return (duration * 30);
    }else if(unit.toLowerCase().includes('an')){
        return (duration * 365);
    }else{
        throw new Error( "Unit duration undefined !");
    }
}

exports.getExistInvoice = (repairs, invoices)=>{
    let incr=0;
    for (let i = 0 ; i < repairs.length ;i++) {
        for (const invoice of invoices) {
            if(invoice.repair_id.equals(repairs[i]._id)){
                incr=0;
                break;
            }
            incr++;
        }
        if(incr!=0){
            repairs.splice(i ,1);
        }
    }
}

exports.creatOjectMatchRepair = (data)=>{
    if(data.search){
        if(data.search.filterCar!=null && data.search.text!=null && data.search.filterStatus !=null  && data.search.date==null){
            return {
                "user_car.user_id" : objectID(data.user_id), 
                ["user_car."+data.search.filterCar]: { $regex : "^.*"+data.search.text+".*" , $options : "i" },
                status : parseInt(data.search.filterStatus)
            }
        }else if(data.search.filterCar==null && data.search.text!=null && data.search.filterStatus !=null  && data.search.date==null){
            return {
                "user_car.user_id" : objectID(data.user_id), 
                "user_car.mark": { $regex : "^.*"+data.search.text+".*" , $options : "i" } ,
                status : parseInt(data.search.filterStatus)
            }
        }else if(data.search.filterCar!=null && data.search.text!=null && data.search.filterStatus ==null && data.search.date==null){
            return {
                "user_car.user_id" : objectID(data.user_id), 
                ["user_car."+data.search.filterCar]: { $regex : "^.*"+data.search.text+".*" , $options : "i" } 
            }
        }else if(data.search.filterCar==null && data.search.text==null && data.search.filterStatus !=null  && data.search.date==null){
            return {
                "user_car.user_id" : objectID(data.user_id), 
                status : parseInt(data.search.filterStatus)
            }
        }else if(data.search.filterStatus !=null && data.search.date!=null) { 
            return {
                "user_car.user_id" : objectID(data.user_id),
                ["user_car."+data.search.filterCar] : { $gte :  new Date(data.search.date+'') },
                status : parseInt(data.search.filterStatus)
            } 
        }else if(data.search.filterStatus==null && data.search.date!=null) { 
            return {
                "user_car.user_id" : objectID(data.user_id),
                ["user_car."+data.search.filterCar] : { $gte :  new Date(data.search.date+'') },
            } 
        }else if(data.search.text!=null){
            return { 
                "user_car.user_id" : objectID(data.user_id),
                "user_car.mark": { $regex : "^.*"+data.search.text+".*" , $options : "i" } ,
            }
        }else{
            return  { "user_car.user_id" : objectID(data.user_id) }
        }
    }else{
        return  { "user_car.user_id" : objectID(data.user_id) }
    }
}

exports.groupUnitDuration = (unit)=>{
    if(unit.toLowerCase().includes('jour')){
        return {
            day: { $dayOfYear: "$update_at"},
            year: { $year: "$update_at" }
        }
    }else if(unit.toLowerCase().includes('mois')){
        return {  
            month : { $month : "$update_at"} , 
            year: { $year: "$update_at" } 
        }
    }else if(unit.toLowerCase().includes('an')){
        return{  
            year: { $year: "$update_at" } 
        }
    }else{
        return {
            day: { $dayOfYear: "$update_at"},
            year: { $year: "$update_at" }
        }
    }
}

exports.getDataTurnover = (unit , dataFind)=>{
    if(unit.toLowerCase().includes('jour')){
        return dayTurnover(dataFind); 
    }else if(unit.toLowerCase().includes('mois')){
        return monthTurnover(dataFind);
    }else{
        return dayTurnover(dataFind); 
    }
}

function dayTurnover(dataFind){
    let montants = [];
    let dates = [];

    for (const data of sortDataDay(dataFind)) {
        montants.push(data.montant);
        dates.push(dateFromDay(data.year , data.day));
    }

    return {
        data : montants,
        labels : dates
    }
}

function sortDataDay(dataFind) {
    let days = [];
    let dataSort = [];
    for (const data of dataFind) {
        days.push(data._id.day);
    }
    days = days.sort((a , b)=> a -b);
    for (const day of days) {
        dataSort.push(
            {
                day : day,
                year:  dataFind.find((data)=> data._id.day == day)._id.year,
                montant : dataFind.find((data)=> data._id.day == day).totalAmount
            }
        )
    }
    return dataSort;
}

function monthTurnover(dataFind){
    let montants = [];
    let contr = 0;
    for (let index = 0; index < 12; index++) {
        for (const dataMonth of dataFind) {
            if(getMonthName(dataMonth._id.month).includes(months[index].toLowerCase())){
                montants.push(dataMonth.totalAmount);
                contr = 0;
                break;
            }
            contr++;
        }

        if (contr!=0) {
            montants.push(0);
        }
    }

    return {
        data : montants,
        labels : months
    }
}

function dateFromDay(year, day){
    var date = new Date(year, 0); // initialize a date in `year-01-01`
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date.setDate(day)).toLocaleString('fr-Fr' , options); // add the number of days
}

function getMonthName(monthNumber) {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('fr-FR', { month: 'long' });
}


exports.getBeneficeGlobal= (dataIncoice , dataSimulation)=> {
    let montBenefice = [];
    let labels = dataIncoice.labels; 
    let dataMont = dataIncoice.data;
    let depense = sumDepense(dataSimulation.data);
    for (let index = 0; index < labels.length; index++) {
        const diff = dataMont[index] - depense;
        montBenefice.push(diff);
    }
    return {
        data : montBenefice,
        labels: labels
    }
}

exports.getBeneficeMois= (dataIncoice , dataSimulation)=>{
    let montBenefice = [];
    let labels = dataIncoice.labels; 
    let dataMont = dataIncoice.data;
    let depenseMois = getDepenseMois(dataSimulation).montants;
    for (let index = 0; index < labels.length; index++) {
        const diff = dataMont[index] - depenseMois[index] ;
        console.log(dataMont[index] , ' - ', depenseMois[index] , "=", diff); 
        montBenefice.push(diff);
    }
    return {
        data : montBenefice,
        labels: labels
    }
}

function getDepenseMois(dataSimulation){
    let labelSimule = [];
    let montSimule = [];
    let incr = 0;
    const dataLoop = dataSimulation.data;
    for (const month of months) {
        for (let index = 0; index < dataLoop.length; index++) {
            if(month==dataLoop[index].month){
                labelSimule.push(month);
                montSimule.push(sumDepense(dataLoop[index]));
                incr=0;
                break;
            }
            incr+=1;
        }
        if(incr!=0){
            labelSimule.push(month); 
            montSimule.push(0) ;
        }
    }
    return {
        montants : montSimule,
        labels : labelSimule
    }
}

function sumDepense(dataSimulation) {
    return (dataSimulation.salary+dataSimulation.rent+dataSimulation.piece+dataSimulation.other)
}

