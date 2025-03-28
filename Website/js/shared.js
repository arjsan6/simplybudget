// GLOBALS
let recurring;

// KEYS FOR LOCAL STORAGE
const DAYS_KEY = "day_key";
const DEFAULT_KEY = "default_key";
const RECUR_KEY = "recurring_key";
const RECUR_TRACKER_INT = "recur_track_int";

/*-------------------------------------------------------------------------------------------*/
/*
    Section: DEFAULT DATA
    Expln: Data that is hardcoded into the system by default

*/
let defaultData = {
    categories:["Food", "Bills", "Other"],
    defaultGoal:20
};


/*-------------------------------------------------------------------------------------------*/
/*
    Section: CLASSES
    Expln: Templates for the code

*/
class Transaction
{
    constructor(amount, reason)
    {
        this._amount = amount;
        this._reason = reason;

        // Recursive transaction attributes
        this._recurring = 0;
        this._startDate = new Date();
        this._recurTrackInt;
    }
    get amount()
    {
        return this._amount;
    }
    set amount(a)
    {
        this._amount = a;
    }
    get reason()
    {
        return this._reason;
    }
    set reason(r)
    {
        this._reason = r;
    }
    set recurring(r)
    {
        this._recurring = r;
    }
    get recurring()
    {
        return this._recurring;
    }
    get startDate()
    {
        return this._startDate;
    }
    set startDate(sD)
    {
        this._startDate = sD;
    }
    get recurTrackInt()
    {
        return this._recurTrackInt;
    }
    set recurTrackInt(rtI)
    {
        this._recurTrackInt = rtI;
    }


    getAmountFormatted()
    {
        let rawData = this._amount;
        let whole = rawData.toString().split(".")[0];
        let decimal = rawData.toString().split(".")[1];
        if (decimal == undefined)
        {
            decimal = "0";
        }
        while (decimal.length < 2)
        {
            decimal += "0";
        }
        if (decimal.length > 2)
        {
            decimal = decimal[0] + decimal[1];
        }
        return `${whole}.${decimal}`;
        
    }
}

class Day
{
    constructor(date)
    {
        this._date = date;
        this._goal = defaultData.defaultGoal;
        this._customGoal = false;
        // IF category is added to defaultData, add the category to all Days, IF category is deleted to defaultData, only delete from Day if no transactions in category
        this._categories = {};
        this.updateWithDefaultData(defaultData.categories); // FILL WITH DEFAULT CATEGORIES
        
    }
    get customGoal()
    {
        return this._customGoal;
    }
    set customGoal(cG)
    {
        this._customGoal = cG;
    }

    get categories()
    {
        return this._categories;
    }
    set categories(c)
    {
        this._categories = c;
    }
    get date()
    {
        return this._date;
    }
    set date(d)
    {
        this._date = d;
    }
    get goal()
    {
        return this._goal;
    }
    set goal(g)
    {
        this._goal = g;
    }

    checkForRecur(recurId)
    {
        for (let catString in this._categories)
        {
            let catArray = this.categories[catString];
            for (let i = 0; i < catArray.length; i++)
            {
                if (catArray[i].recurTrackInt == recurId)
                {
                    return true;
                }
            }
        }
        return false;
    }

    getSpent()
    {
        let spent = 0;
        for (let catString in this._categories)
        {
            let catArray = this.categories[catString];
            for (let i = 0; i < catArray.length; i++)
            {
                spent += catArray[i].amount;
            }
        }
        return spent;
    }

    getRemaining()
    {
        return this._goal-this.getSpent();
    }

    addTransaction(category, transactionObj)
    {
        this.categories[category].push(transactionObj);
    }

    deleteTransaction(category, index)
    {
        this.categories[category].splice(index, 1);
    }

    getTransaction(category, index)
    {
        return this.categories[category][index];
    }

    addCategory(catString)
    {
        if (this.categories[catString] == null)
        {
            // Does not already exist
            this.categories[catString] = [];
            return true;
        }
        else 
        {
            return false;
        }
    }

    deleteCategory(catString)
    {
        if (this.categories[catString] != undefined && this.categories[catString].length == 0)
        {
            // i.e. the array is empty and not already deleted
            delete this.categories[catString];
        }
    }

    updateWithDefaultData(categories)
    {
        let flag_copy = JSON.parse(JSON.stringify(this.categories));
        for (let index = 0; index < categories.length; index++)
        {
            this.addCategory(categories[index]);
            flag_copy[categories[index]] = 'k'; // 'k' for keep
        }
        for (let cat in flag_copy)
        {
            if (flag_copy[cat] != 'k')
            {
                this.deleteCategory(cat);
            }
        }
    }
    
    checkIfEmpty(dataObj)
    {
        for (let catString in dataObj)
        {
            if (dataObj[catString].length > 0)
            {
                return false;
            }
        }
        return true;
    }
    
    fromData(dataObj)
    {   
        // dataObj is Day object
        this._goal = dataObj._goal;
        this._date = new Date(dataObj._date);
        this._customGoal = dataObj._customGoal;
        if (dataObj._customGoal || !this.checkIfEmpty(dataObj._categories))
        {
            // Add object as goal is not the same OR object is not empty
            for (let catString in dataObj._categories)
            {
                for (let i = 0; i < dataObj._categories[catString].length; i++)
                {
                    if (i == 0)
                    {
                        this._categories[catString] = []; // Initialise array
                    }
                    let transactionToAdd = new Transaction(dataObj._categories[catString][i]._amount, dataObj._categories[catString][i]._reason);
                    transactionToAdd._startDate = new Date(dataObj._categories[catString][i]._startDate);
                    transactionToAdd._recurring = dataObj._categories[catString][i]._recurring;
                    transactionToAdd._recurTrackInt = dataObj._categories[catString][i]._recurTrackInt;
                    this._categories[catString].push(transactionToAdd);
                }
            }
            this.updateWithDefaultData(defaultData.categories);
            return true;
        }
        else
        {
            return false;
        }
    }
}

class Days
{
    constructor()
    {
        // Load default day as index one (as today)
        this._days = [];
        this._currentIndex = 0;
        
    }

    set currentIndex(cI)
    {
        this._currentIndex = cI;
    }
    get currentIndex()
    {
        return this._currentIndex;
    }
    set days(d)
    {
        this._days = d;
    }
    get days()
    {
        return this._days;
    }

    getDay()
    {
        return this._days[this._currentIndex];
    }

    getDate()
    {
        return this._days[this._currentIndex].date;
    }

    getGoal()
    {
        return this._days[this._currentIndex].goal;
    }
    getGoalFormatted()
    {
        let rawData = this._days[this._currentIndex].goal;
        let whole = rawData.toString().split(".")[0];
        let decimal = rawData.toString().split(".")[1];
        if (decimal == undefined)
        {
            decimal = "0";
        }
        while (decimal.length < 2)
        {
            decimal += "0";
        }
        if (decimal.length > 2)
        {
            decimal = decimal[0] + decimal[1];
        }
        return `$${whole}.${decimal}`;
        
    }


    shiftNextDay()
    {
        this._currentIndex++;
        let dateToAdd = new Date((this._days[this._currentIndex-1].date).valueOf() + 1000*3600*24);
        let dayToAdd = new Day(dateToAdd);
        if (this._days[this._currentIndex] == null)
        {
            // No day exists past currentIndex
            this._days[this.currentIndex] = dayToAdd;
            
        }
        else if (!compareDates(this._days[this._currentIndex].date,dateToAdd))
        {
            // No consecutive day exists
            this._days.splice(this._currentIndex, 0, dayToAdd);
        }
    }

    shiftPrevDay()
    {
        
        let dateToAdd = new Date((this._days[this._currentIndex].date).valueOf() - 1000*3600*24);
        let dayToAdd = new Day(dateToAdd);
        if (this._currentIndex - 1 < 0)
        {
            // No day exists past currentIndex
            this._days.splice(this._currentIndex, 0, dayToAdd);
        }
        else if (!compareDates(this._days[this._currentIndex - 1].date,dateToAdd))
        {
            // No consecutive day exists
            
            // No consecutive day exists
            this._days.splice(this._currentIndex, 0, dayToAdd);
            
        }
        else
        {
            this._currentIndex--;
        }

        return true;
    }

    shiftSpecDay(dateObj)
    {
        let dayToAdd = new Day(dateObj);
        for (let i = 0; i < this._days.length; i++)
        {
            if (compareDates(this.days[i].date,dateObj))
            {
                // Found it
                this._currentIndex = i;
                return;
            }
            else if (this.days[i].date > dateObj)
            {
                // Gone past date [SPLICE A NEW DAY HERE AT INDEX i]
                
                this.days.splice(i, 0, dayToAdd);
                this._currentIndex = i;
                return;
            }

        }
        // End of array, splice date here
        this.days.push(dayToAdd);
        this._currentIndex = this.days.length-1;
    }

    fromData(dataObj)
    {
        this._currentIndex = dataObj._currentIndex; // Puts user where they left off (if add today was not initiated)
        for (let i = 0; i < dataObj._days.length; i++)
        {
            let dayToAdd = new Day(new Date());
            let addDay = dayToAdd.fromData(dataObj._days[i]);
            if (addDay)
            {
                this._days.push(dayToAdd);
            }

        }
    }


}


/*-------------------------------------------------------------------------------------------*/
/*
    Section: AUX FUNCTIONS
    Expln: Functions that do calcs, or repeated code

*/
// Compares two dates
function compareDates(date1, date2)
{
    return (date1.getDate() == date2.getDate() && date1.getMonth() == date2.getMonth() && date1.getFullYear() == date2.getFullYear());
}

// Converts a number to a currency string i.e. '$XX.XX'
function numToCurrency(rawData)
{
        let whole = rawData.toString().split(".")[0];
        let decimal = rawData.toString().split(".")[1];
        if (decimal == undefined)
        {
            decimal = "0";
        }
        while (decimal.length < 2)
        {
            decimal += "0";
        }
        if (decimal.length > 2)
        {
            decimal = decimal[0] + decimal[1];
        }
        return `$${whole}.${decimal}`;
}


/*-------------------------------------------------------------------------------------------*/
/*
    Section: CLASS FUNCTIONS
    Expln: Functions that interact with the classes, form connection with javascript in viewDay.js

*/
// Creates a transaction
function createTransaction(category, amount, reason)
{
    let transactionToAdd = new Transaction(amount, reason);
    days.getDay().addTransaction(category, transactionToAdd);
    saveData();
}   


function createRecursionTransaction(transactionObj, category)
{
    let transactionToAdd = new Transaction(transactionObj.amount, transactionObj.reason);
    transactionToAdd.recurTrackInt = transactionObj.recurTrackInt;
    transactionToAdd.recurring = transactionObj.recurring;
    transactionToAdd.dateToAdd = transactionObj.dateToAdd;
    days.getDay().addTransaction(category, transactionToAdd);
    saveData();
}   

// Deletes the transaction
function deleteTransaction(category, index_id)
{
    days.getDay().deleteTransaction(category, index_id);
    saveData();
}

// Changes a transaction
function editTransaction(category, index_id, amount, reason)
{
    days.getDay().getTransaction(category, index_id).amount = amount;
    days.getDay().getTransaction(category, index_id).reason = reason;
    saveData();
}

// Swaps the category of a transaction
function changeCategory(oldCategory, oldId, newCategory)
{
    let reason = days.getDay().getTransaction(oldCategory, oldId).reason;
    let amount = days.getDay().getTransaction(oldCategory, oldId).amount;
    let transactionToChange = new Transaction(amount, reason);
    days.getDay().deleteTransaction(oldCategory, oldId);
    days.getDay().addTransaction(newCategory, transactionToChange);
    saveData();

}


/*-------------------------------------------------------------------------------------------*/
/*
    Section: LOCAL DATA STORAGE
    Expln: Functions for storing data in local storage

*/
// Saves data to local storage
function saveData()
{
    localStorage.setItem(DEFAULT_KEY, JSON.stringify(defaultData));
    let daysToSave = new Days();
    daysToSave.fromData(days); // Prevents empty/non-customised days from being added
    localStorage.setItem(DAYS_KEY, JSON.stringify(daysToSave));
}

function loadDefaultData()
{
    // LOAD DATA INTO DEFAULT CATEGORIES
    if (localStorage.getItem(DEFAULT_KEY) != null)
    {
        // Load default key, else if empty keep as hardcoded values
        defaultData = JSON.parse(localStorage.getItem(DEFAULT_KEY));
    }
}

// Loads data 
function loadData()
{
    // LOAD DATA INTO DEFAULT CATEGORIES
    if (localStorage.getItem(DEFAULT_KEY) != null)
    {
        // Load default key, else if empty keep as hardcoded values
        defaultData = JSON.parse(localStorage.getItem(DEFAULT_KEY));
    }


    // Check if local storage exists on device, else start fresh
    if (localStorage.getItem(DAYS_KEY) != null)
    {
        let daysObj = JSON.parse(localStorage.getItem(DAYS_KEY));
        days = new Days(); // Create fresh copy of days
        days.fromData(daysObj); // Load in data
    }
    else
    {
        // CREATE FRESH COPY
        days = new Days();
        days.shiftSpecDay(new Date()); // Create day for 'today'
    }


}

// Clears data in local storage
function clearLocalStorage()
{
    localStorage.removeItem(DAYS_KEY);
    localStorage.removeItem(DEFAULT_KEY);
    localStorage.removeItem(RECUR_KEY);
    localStorage.removeItem(RECUR_TRACKER_INT);
}

// Gets recurring data from local storage
function loadRecurData()
{
    if (localStorage.getItem(RECUR_KEY) != null)
    {
        let recurObj = JSON.parse(localStorage.getItem(RECUR_KEY));
        recurring = new Day();
        recurring.fromData(recurObj);
    }
    else
    {
        recurring = new Day(new Date());
    }
}

function storeRecurData()
{
    localStorage.setItem(RECUR_KEY, JSON.stringify(recurring));
}

// Returns the assignment index
function incrementRecurTracker()
{
    if (localStorage.getItem(RECUR_TRACKER_INT) != null)
    {
        let recur_int = Number(localStorage.getItem(RECUR_TRACKER_INT));
        recur_int++;
        localStorage.setItem(RECUR_TRACKER_INT, recur_int);
        return recur_int;
    }
    else
    {
        // Create first id
        let recur_int = 0;
        localStorage.setItem(RECUR_TRACKER_INT, recur_int);
        return recur_int;
    }
}

function returnRecursiveObj(rIndex)
{
    for (let catString in recurring.categories)
    {
        for (let i = 0; i < recurring.categories[catString].length; i++)
        {
            if (recurring.categories[catString][i].recurTrackInt == rIndex)
            {
                return recurring.categories[catString][i];
            }
        }
    }
    return false;
}
function returnCategory(rIndex)
{
    for (let catString in recurring.categories)
    {
        for (let i = 0; i < recurring.categories[catString].length; i++)
        {
            if (recurring.categories[catString][i].recurTrackInt == rIndex)
            {
                return catString;
            }
        }
    }
    return false;
}

function compareTransactions(t1, t2)
{
    if (t1.amount == t2.amount)
    {
        if (t1.reason == t2.reason)
        {
            return true;
        }
    }
    return false;
}