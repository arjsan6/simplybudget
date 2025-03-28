
function mdlUpdates()
{
    displayDefaultData();
}

// DATA FUNCTIONS
function loadDefaultData()
{
    if (localStorage.getItem(DEFAULT_KEY) != null)
    {
        defaultData = JSON.parse(localStorage.getItem(DEFAULT_KEY)); // Else just use default from shared.js
    }
}

function saveDefaultData()
{
    localStorage.setItem(DEFAULT_KEY, JSON.stringify(defaultData));
}

function displayDefaultData()
{
    document.getElementById("goalInputDiv").classList.add("is-dirty");
    document.getElementById("goalInput").value = defaultData.defaultGoal;
    let tableBody = document.getElementById("tableBody");
    let output = "";
    for (let i = 0; i < defaultData.categories.length; i++)
    {
        output += `<tr> 
        <td style="text-align: center;">${defaultData.categories[i]}</td>
        <td style="text-align: center;"><button onclick="deleteCategory(${i})" class="mdl-button mdl-js-button mdl-button-icon mdl-color-text--red"><i class="material-icons">delete</i></button></td>
    </tr>`;
    }
    tableBody.innerHTML = output;
}

function deleteCategory(index)
{
    defaultData.categories.splice(index,1);
    saveDefaultData();
    displayDefaultData();
}

function addCategory()
{
    
    let input = document.getElementById("categoryInput").value;
    if (input == "")
    {
        alert("Cannot have an empty category!");
        return;
    }
    for (let i = 0; i < defaultData.categories.length; i++)
    {
        if (defaultData.categories[i] == input)
        {
            alert(`Category already exists! (It's the ${i+1}th one)`);
            return;
        }
    }

    // ELSE ADD THE CATEGORY
    defaultData.categories.push(input);
    saveDefaultData();
    displayDefaultData();

    // Clear input
    document.getElementById("categoryInput").value = "";
    document.getElementById("catInputDiv").classList.remove("is-dirty");
}

function addGoal()
{
    defaultData.defaultGoal = document.getElementById("goalInput").value;
    saveDefaultData();
    displayDefaultData();
}
/*-------------------------------------------------------------------------------------------*/
/*
    Section: CODE TO RUN WHEN DOCUMENT LOADS + ASIM FUNCTIONS (i.e. event listeners)
    Expln: Code that will run when something is triggered

*/
$(document).ready(function() {
    /*--------------- DOCLOAD FUNCTIONS ----------------*/
    let html_content = $("#viewWindow").clone()[0].innerHTML;
    runMDL();
    loadDefaultData();
    formatScreen(html_content);

    /*--------------- ASIM FUNCTIONS ----------------*/
    window.addEventListener('resize', function () {
        if (!mobile)
        {
            formatScreen(html_content);
        }
    });

});

