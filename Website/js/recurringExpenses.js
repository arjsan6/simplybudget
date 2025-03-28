// GLOBALS
let days = new Days();

/*-------------------------------------------------------------------------------------------*/
/*
    Section: HTML USER FUNCTIONS
    Expln: Functions that interact directly with the 
    document (i.e. document.getElement...)

*/

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
    <td class="frequency"><pre><b>Every: ${transactionObj.recurring} days \nStart: ${formatDateNormally(transactionObj.startDate)}</b></pre></td>
    <td class="amount"><pre>$${transactionObj.getAmountFormatted()}\n${reason}</pre></td>
    <td><button onclick="openPopUp('${catString}', ${transactionObj.amount}, '${transactionObj.reason}', ${transactionObj.recurring}, '${formatDate(transactionObj.startDate)}',  ${transactionId})" class="mdl-button mdl-js-button mdl-button--icon mdl-button--colored">
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
    let currentDay = recurring;
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
    let currentDay = recurring;
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
function openPopUp(category = null, amount = null, reason = null, frequency = null, startingDate = null, editId = null)
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
    document.getElementById("frequencyInputDiv").classList.remove("is-dirty");
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
    if (frequency != null)
    {
        document.getElementById("frequencyInputDiv").classList.add("is-dirty");
        document.getElementById("frequencyInput").value = frequency;
    }
    else
    {
        document.getElementById("frequencyInput").value = "";

    }
    
    if (startingDate != null)
    {
        document.getElementById("startingDateDiv").classList.add("is-dirty");
        document.getElementById("startingDate").value = startingDate;
    }
    else
    {
        document.getElementById("startingDateDiv").classList.add("is-dirty");
        document.getElementById("startingDate").value = formatDate(new Date());

    }
}


/*-------------------------------------------------------------------------------------------*/
/*
    Section: OVERLAY FORMAT FUNCTIONS
    Expln: Format the overlays

*/

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

function formatDateNormally(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [day, month, year].join('/');
}

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
    let frequency = document.getElementById("frequencyInput").value;
    let startDate = new Date(document.getElementById("startingDate").value);
    if (category == "")
    {
        alert("Need to select a category");
    }
    else if (expense == "")
    {
        alert("Enter an expense amount ($)");
    }
    else if (frequency == "")
    {
        alert("Need to enter a frequency for repeating this expense")
    }
    else 
    {
        // Save to days + update list
        expense = Number(expense); // CONVERT STRING TO NUM\
        frequency = Number(frequency);
        if (editId != null)
        {
            if (Number(frequency) == 0) {
                deleteTrans(category, editId);
                updateDisplay();
                closePopUp();
                return;
            }
            // i.e. element is being edited
            //editTransaction(days.getDay().categories[editCategory][editId], editId, editCategory);
           
            editTransaction_recur(editCategory, editId, expense, reason, frequency, startDate);
            if (editCategory != category)
            {
                // User changed the category
                changeCategory_recur(editCategory, editId, category);
            }
           
            updateDisplay();
        }
        else
        {
            // Add new day object to day
            createTransaction_recur(category, expense, reason, frequency, startDate);
            updateDisplay();
        }
        closePopUp();
    }
}

// Deletes transaction
function deleteTrans(category, editId)
{
    deleteTransaction_recur(category, editId);
    updateDisplay();
    closePopUp();
}

/*-------------------------------------------------------------------------------------------*/
/*
    Section: DATA FUNCTIONS
    Expln: Specficallu for recurring transactions

*/
function deleteTransaction_recur(category, index_id)
{
    let transactionObj = recurring.getTransaction(category, index_id);
    deleteRecur(transactionObj, category);
    recurring.deleteTransaction(category, index_id);
    storeRecurData();
}
function createTransaction_recur(category, amount, reason, frequency, startDate)
{
    let transactionToAdd = new Transaction(amount, reason);
    transactionToAdd.recurring = frequency;
    transactionToAdd.startDate = startDate;
    transactionToAdd.recurTrackInt = incrementRecurTracker();
    recurring.addTransaction(category, transactionToAdd);
    storeRecurData();
}
function changeCategory_recur(oldCategory, oldId, newCategory)
{
    let reason = recurring.getTransaction(oldCategory, oldId).reason;
    let amount = recurring.getTransaction(oldCategory, oldId).amount;
    let frequency = recurring.getTransaction(oldCategory, oldId).recurring;
    let startDate = recurring.getTransaction(oldCategory, oldId).startDate;
    deleteTransaction_recur(oldCategory, oldId);
    createTransaction_recur(newCategory, amount, reason, frequency, startDate);
}
function editTransaction_recur(category, index_id, amount, reason, frequency, startDate)
{
    recurring.getTransaction(category, index_id).amount = amount;
    recurring.getTransaction(category, index_id).reason = reason;
    recurring.getTransaction(category, index_id).recurring = frequency;
    recurring.getTransaction(category, index_id).startDate = startDate;
    recurring.getTransaction(category, index_id).recurTrackInt = incrementRecurTracker();
    storeRecurData();
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
    });

    $( document ).ready(function() {
        componentHandler.upgradeAllRegistered();
        formatFab();
        updateDisplay();
    });
}

// Goes through local storage days object, and fills the transaction object from the start
// date to today() [NON INCLUSIVE OF TODAY]
function deleteRecur(transactionObj, category)
{
    loadData();
    let today = new Date();
    let currentDate = transactionObj.startDate;
    while (currentDate <= today)
    {
        days.shiftSpecDay(currentDate);
        if (!days.getDay().checkForRecur(transactionObj.recurTrackInt))
        {
            // Does not exist on page
            createRecursionTransaction(transactionObj, category);
        }
        currentDate = new Date(currentDate.valueOf() + 1000*3600*24*transactionObj.recurring); // Incremenet by _recurring attribute
    }
    saveData();

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
    loadDefaultData();
    loadRecurData();
    formatScreen(html_content);
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
    });

});

