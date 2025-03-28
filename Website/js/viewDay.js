// GLOBALS
let days = new Days();


/*-------------------------------------------------------------------------------------------*/
/*
    Section: HTML USER FUNCTIONS
    Expln: Functions that interact directly with the 
    document (i.e. document.getElement...)

*/
// Changes the date portion of the page
function updateDate()
{
    let today = new Date();
    let tomorrow = new Date(today.valueOf() + 1000*3600*24);
    let yesterday = new Date(today.valueOf() - 1000*3600*24);
    let currentDate = days.getDate();
    let date_day = currentDate.getDate();
    let date_month = currentDate.getMonth()+1;
    let date_year = currentDate.getFullYear();
    // Format date
    if (date_day.toString().length < 2)
    {
        date_day = "0" + date_day;
    }
    if (date_month.toString().length < 2)
    {
        date_month = "0" + date_month;
    }
    let dateString = `${date_year}-${date_month}-${date_day}`;
    document.getElementById("selectedDate").value = dateString;
    let label = "";
    // Test if today, yesterday or tomorow
    if (compareDates(currentDate, today))
    {
        // Date is today
        label += " - Today";
    }
    else if (compareDates(currentDate, yesterday))
    {
        // Date is yesterday
        label += " - Yesterday";
    }
    else if (compareDates(currentDate, tomorrow))
    {
        // Date is tomorrow
        label += " - Tomorrow";
    }
    
    document.getElementById("dateLabel").innerHTML = label;
    updateMoney();


}

// Changes the goal, spent and remaining text on the page
function updateMoney()
{
// Set goal
    document.getElementById("goalText").innerHTML = days.getGoalFormatted();
    document.getElementById("spentText").innerHTML = numToCurrency(days.getDay().getSpent());
    document.getElementById("remainingText").innerHTML = numToCurrency(days.getDay().getRemaining());
    if (days.getDay().getRemaining() < 0)
    {
        document.getElementById("spentText").style = "color: red";
        document.getElementById("remainingText").style = "color: red";
        
    }
    else
    {
        document.getElementById("spentText").style = "color: green";
        document.getElementById("remainingText").style = "color: green";

    }
}

// Adds a category div
function addCategory_HTML(catString)
{
    let output = document.getElementById("annexCategories").innerHTML;
    output += `<div id="CATEGORY_${catString}"><table class="category mdl-data-table mdl-js-data-table">
    <thead ><div class="category-title">${catString}</div></thead><tbody ></tbody></table>
<button onclick="openPopUp('${catString}');" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-color--accent mdl-color-text--white" style="text-align: center; width: 100%; height: 35px; border: none; margin-bottom: 30px; text-transform: none; font-size: 13px">
    + Add an expense
</button></div>`;
    document.getElementById("annexCategories").innerHTML = output;
}

// Removes category divs
function removeCategory_HTML(catString)
{
    document.getElementById(`CATEGORY_${catString}`).remove();
}

// Adds transaction divs
function addTransaction_HTML(transactionObj, transactionId, catString)
{
    let reason;
    if (transactionObj.reason == "")
    {
        reason = "No Reason Given";
    }
    else
    {
        reason = transactionObj.reason;
    }
    let output = `<tr class="${transactionId}">
    <td class="amount">$${transactionObj.getAmountFormatted()}</td>
    <td class="reason mdl-data-table__cell--non-numeric">${reason}</td>
    <td><button onclick="openPopUp('${catString}', ${transactionObj.amount}, '${transactionObj.reason}', ${transactionId})" class="mdl-button mdl-js-button mdl-button--icon mdl-button--colored">
      <i class="material-icons">edit</i>
    </button></td>
  </tr>`;
    let table = document.getElementById(`CATEGORY_${catString}`).getElementsByTagName("tbody")[0];
    table.insertAdjacentHTML( 'beforeend', output );

}

// Removes transaction divs
function removeTransaction_HTML(transactionId, catString)
{
    document.getElementById(`CATEGORY_${catString}`).getElementsByClassName(transactionId)[0].remove();
}

// Changes transaction divs
function editTransaction_HTML(transactionObj, transactionId, catString)
{
    let table = document.getElementById(`CATEGORY_${catString}`).getElementsByClassName(transactionId)[0];
    table.getElementsByClassName("amount")[0].innerText = `$${transactionObj.getAmountFormatted()}`;
    table.getElementsByClassName("reason")[0].innerText = transactionObj.reason;

}

// Swaps category of transaction divs
function changeCategoryofTransaction(oldCategory, oldId, newCategory, newId)
{   
    let rowToCopy = document.getElementById(`CATEGORY_${oldCategory}`).getElementsByClassName(oldId)[0];
    let table = document.getElementById(`CATEGORY_${newCategory}`).getElementsByTagName("tbody")[0];
    table.insertAdjacentHTML( 'beforeend', rowToCopy.innerHTML );
    // Change ID
    table.lastElementChild.className = newId;
    rowToCopy.remove();

}

// Auto selects the default value in the select category menu, in the overlay menu
function updateSelectCategories_HTML(category = null)
{
    document.getElementById("selectMenu").classList.remove("is-dirty");
    let currentDay = days.getDay();
    let output = `<option></option>`;
    for (let catString in currentDay.categories)
    {
        if (category == catString)
        {
            
            document.getElementById("selectMenu").classList.add("is-dirty");
            output +=  `<option value="${catString}" selected>${catString}</option>`;
            
        }
        else
        {
            
            output +=  `<option value="${catString}">${catString}</option>`;
        }
    }
    document.getElementById("category").innerHTML = output;
}


/*-------------------------------------------------------------------------------------------*/
/*
    Section: COMBI FUNCTIONS
    Expln: Functions that use document functions and classes

*/
// Updates entire display from scratch (empty categories added after)
function updateDisplay()
{
    document.getElementById("annexCategories").innerHTML = ``;
    let emptyCategories = [];
    let currentDay = days.getDay();
    for (let catString in currentDay.categories)
    {
        if (currentDay.categories[catString].length > 0)
        {
            addCategory_HTML(catString);
            let transactions = currentDay.categories[catString];
            for (let i = 0; i < transactions.length; i++) {
                addTransaction_HTML(transactions[i], i, catString);
            }
        }
        else
        {
            // Add after
            emptyCategories.push(catString);
        }
        
    }
    for (let i = 0; i < emptyCategories.length; i++)
    {
        let catString = emptyCategories[i];
        addCategory_HTML(catString);
            let transactions = currentDay.categories[catString];
            for (let i = 0; i < transactions.length; i++) {
                addTransaction_HTML(transactions[i], i, catString);
            }
    }
    updateMoney();
}

function onDateChange()
{
    if (days.getDay().date > new Date())
    {
        let oldDay = days.getDay();
    let removeFromStorage = true;
    for (let catString in oldDay.categories)
    {
        let catList = oldDay.categories[catString];
        for (let i = 0; i < catList.length; i++)
        {
            if (catList[i].recurTrackInt == undefined)
            {
                removeFromStorage = false;
                break;
            }
            else if (returnRecursiveObj(catList[i].recurTrackInt) == false)
            {
                // Does not exist in current list
                removeFromStorage = false;
                break;
            }
            else if (!compareTransactions(returnRecursiveObj(catList[i].recurTrackInt), catList[i]))
            {
                // Not the same as the other object
                removeFromStorage = false;
                break;
            }
            else if (returnCategory(catList[i].recurTrackInt) != catString)
            {
                // Not the same category
                removeFromStorage = false;
                break;

            }
        }
        if (!removeFromStorage)
        {
            break;
        }
    }
    if (removeFromStorage)
    {
        days.days[days.currentIndex] = new Day(days.getDay().date);
        saveData();
        //console.log("OOP GETTIN RID OF THAT - HAHAH");
    }
    }

    
    
}

// Goes to next date
function goNextDate()
{
    onDateChange();
    days.shiftNextDay();
    updateDate();
    addRecur();
    updateDisplay();
    // NEED TO HAVE AN UPDATE DATA FUNCTION AS WELL
}

// Goes to previous date
function goPrevDate()
{
    onDateChange();
    days.shiftPrevDay();
    updateDate();
    addRecur();
    updateDisplay();
}

// Goes to a specfic date
function goSpecDate(e)
{
    onDateChange();
    let dateInput = e.target.value;
    let dIObject = new Date(dateInput);
    console.log(dIObject);
    days.shiftSpecDay(dIObject);
    updateDate();
    addRecur();
    updateDisplay();
}


/*-------------------------------------------------------------------------------------------*/
/*
    Section: POPUP CONTROLS
    Expln: Open and close popups

*/
// Closes transaction popup
function closePopUp()
{
    document.getElementById("overlay-black").style = "display: none";
    document.getElementById("overlay-add").style = "display: none";
}

// Opens transaction popup
function openPopUp(category = null, amount = null, reason = null, editId = null)
{
    document.getElementById("overlay-black").style = "display: block";
    document.getElementById("overlay-add").style = "display: block";
    if (editId == null)
    {
        
        // HIDE DELETE BUTTON
        document.getElementById("delete-button").style = "display: none";
        document.getElementById("overlay-button").setAttribute("onClick", "addExpense()");
        document.getElementById("overlay-button").innerText = "Add Expense";
        
        
    }
    else
    {
        document.getElementById("overlay-button").setAttribute("onClick", `addExpense('${category}', ${editId})`);
        document.getElementById("overlay-button").innerText = "Modify Expense";
        // SHOW AND EDIT ATTRIBUTES OF DELETE BUTTON TOP RIGHT CORNER
        document.getElementById("delete-button").style = "display: block";
        document.getElementById("delete-button").setAttribute("onClick", `deleteTrans('${category}', ${editId});`);
    }
    formatOverlay();
    // Format text inside inputs
    
    document.getElementById("expenseAmountDiv").classList.remove("is-dirty");
    document.getElementById("reasonDiv").classList.remove("is-dirty");
    updateSelectCategories_HTML(category);
    if (amount != null)
    {
        
        document.getElementById("expenseAmountDiv").classList.add("is-dirty");
        document.getElementById("expenseAmount").value = amount;
    }
    else
    {
        document.getElementById("expenseAmount").value = "";
    }
    if (reason != null)
    {
        document.getElementById("reasonDiv").classList.add("is-dirty");
        document.getElementById("reason").value = reason;
    }
    else
    {
        
        document.getElementById("reason").value = "";
    }
}

// Opens goal popup
function openGoalUp()
{
    document.getElementById("overlay-black").style = "display: block";
    document.getElementById("overlay-goal").style = "display: block";
    formatGoalPopup();
}

// Closes goal popup
function closeGoalUp()
{
    document.getElementById("overlay-black").style = "display: none";
    document.getElementById("overlay-goal").style = "display: none";
}


/*-------------------------------------------------------------------------------------------*/
/*
    Section: OVERLAY FORMAT FUNCTIONS
    Expln: Format the overlays

*/

// Formats FAB Button overlay
function formatFab()
{
    let view = document.getElementsByClassName("mdl-layout__container")[0];
    let posInfo = view.getBoundingClientRect();
    let button = document.getElementById("fab_button");
    button.style = `right: ${posInfo.left+20}px; bottom: ${posInfo.top+20}px`;
}

// Formats transaction overlay
function formatOverlay()
{
    let styleText = "";
    let overlay = document.getElementById("overlay-add");
    let black = document.getElementById("overlay-black");
    let button_overlay = document.getElementById("overlay-button");
    let inputs = document.getElementsByClassName("overlay-inputs");
    let view = document.getElementsByClassName("mdl-layout__container")[0];
    let posInfo = view.getBoundingClientRect();
    // Set element width
    styleText += `width: ${posInfo.width*0.8}px;`; // 80% of width
    styleText += `height: ${posInfo.height*0.8}px;`; // 80% of height
    overlay.style = styleText;
    black.style = `width: ${posInfo.width}px; height: ${posInfo.height}px`;
    for (let i = 0; i < inputs.length; i++)
    {
        inputs[i].style =  `width: ${posInfo.width*0.8*0.8}px;`;
    }
    button_overlay.style = `width: ${posInfo.width*0.8*0.7}px`;
    
}

// Formats the goal overlay
function formatGoalPopup()
{
    let goal = document.getElementById("overlay-goal");
    let black = document.getElementById("overlay-black");
    let input = document.getElementById("overlay-input-div");
    let view = document.getElementsByClassName("mdl-layout__container")[0];
    let posInfo = view.getBoundingClientRect();
    black.style = `width: ${posInfo.width}px; height: ${posInfo.height}px`;
    goal.style = `width: ${posInfo.width*0.8}px`;
    input.style =  `width: ${posInfo.width*0.8*0.8}px;`;
}


/*-------------------------------------------------------------------------------------------*/
/*
    Section: SUBMIT BUTTONS
    Expln: Code that will run when submit button is pressed

*/
// Adds transaction
function addExpense(editCategory = null, editId = null)
{
    let category = document.getElementById("category").value;
    let expense = document.getElementById("expenseAmount").value;
    let reason = document.getElementById("reason").value;
    if (category == "")
    {
        alert("Need to select a category");
    }
    else if (expense == "")
    {
        alert("Enter an expense amount ($)");
    }
    else 
    {
        // Save to days + update list
        expense = Number(expense); // CONVERT STRING TO NUM
        if (editId != null)
        {
            // i.e. element is being edited
            //editTransaction(days.getDay().categories[editCategory][editId], editId, editCategory);
           
            editTransaction(editCategory, editId, expense, reason);
            if (editCategory != category)
            {
                // User changed the category
                changeCategory(editCategory, editId, category);
            }
           
            updateDisplay();
        }
        else
        {
            // Add new day object to day
            createTransaction(category, expense, reason);
            updateDisplay();
        }
        closePopUp();
    }
}

// Deletes transaction
function deleteTrans(category, editId)
{
    deleteTransaction(category, editId);
    updateDisplay();
    closePopUp();
}

// Changes transaction
function editGoal()
{
    let goal = document.getElementById("goalAmount").value;
    if (goal == "")
    {
        alert("Enter valid amount");
    }
    else 
    {
        // Change goal
        days.days[days.currentIndex].goal = Number(goal);
        if (Number(goal) != defaultData.defaultGoal)
        {  
            days.days[days.currentIndex].customGoal = true;
        }
        else
        {
            days.days[days.currentIndex].customGoal = false;
        }
        updateMoney();
        closeGoalUp();
        saveData();
    }
}

/*-------------------------------------------------------------------------------------------*/
/*
    Section: AUX FUNCTIONS
    Expln: Other functions

*/
// Runs each time the screen is resized and subsequently wiped
function mdlUpdates()
{
    $("#overlay-black").click(function() {
        closePopUp();
        closeGoalUp();
    });

    $("#setGoal").click(openGoalUp);
    $( document ).ready(function() {
        componentHandler.upgradeAllRegistered();
        updateDate();
        updateDisplay();
        formatFab();
    });
}

// Adds all existing recursive expenses (if day >= today && if it hasn't been added already)
function addRecur()
{
    let currentDate = days.getDay().date;
    currentDate.setHours(0,0,0,0);
    for (let category in recurring.categories)
    {
        for (let i = 0; i < recurring.categories[category].length; i++)
        {
            let recursiveInt = recurring.categories[category][i].recurring;
            let recursionStartDate = recurring.categories[category][i].startDate;
            recursionStartDate.setHours(0,0,0,0);
            let dayDifference = (currentDate-recursionStartDate)/(24*60*60*1000);
            if (dayDifference >= 0 && Math.round(dayDifference%recursiveInt) == 0)
            {
                // Check transaction recursive object doesn't already exist and add if so
                if (!days.getDay().checkForRecur(recurring.categories[category][i].recurTrackInt)) {
                    // Does not exist on page
                    createRecursionTransaction(recurring.categories[category][i], category);
                    //console.log("INSERTED");
                }
            }
        }
    }
    
}



/*-------------------------------------------------------------------------------------------*/
/*
    Section: CODE TO RUN WHEN DOCUMENT LOADS + ASIM FUNCTIONS (i.e. event listeners)
    Expln: Code that will run when something is triggered

*/
$(document).ready(function() {
    /*--------------- DOCLOAD FUNCTIONS ----------------*/
    let html_content = $("#viewWindow").clone()[0].innerHTML;
    runMDL(); // Runs from script file in min.js
    loadData();
    loadRecurData();
    formatScreen(html_content);
    days.shiftSpecDay(new Date());
    addRecur();
    updateDate();
    updateDisplay();

    /*--------------- ASIM FUNCTIONS ----------------*/
    window.addEventListener('resize', function () {
        if (!mobile)
        {
            formatScreen(html_content);
        }
    });

    $("#overlay-black").click(function () {
        closePopUp();
        closeGoalUp();
    });

    $("#setGoal").click(openGoalUp);
    
});

