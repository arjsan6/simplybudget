let days;

function renderTable()
{
    let date1 = document.getElementById("date1").value;
    let date2 = document.getElementById("date2").value;
    if (date1 == "" || date2 == "")
    {
        alert("Must select a date!");
        return;
    }
    let existingCategories = [];
    let reference = {};
    let tableTemplate = `
    <table id="viewingTable">
                            <tr id="dateRow">
                              <th></th>
                            </tr>
                            <tr id="totalRow">
                              <td>Total Spent</td>
                            </tr>
                            <tr id="goalRow">
                              <td>Goal</td>
                            </tr>
                            <tr>
                              <td><b>Categories</b></td>
                            </tr>
                          </table>
    `;
    document.getElementsByClassName("table-view-box")[0].innerHTML = tableTemplate;

    let startDate = new Date(date1);
    let endDate = new Date(date2);
    startDate.setHours(0,0,0,0);
    endDate.setHours(0,0,0,0);
    days = new Days();
    loadData();
    recurring = new Day(new Date());
    loadRecurData();

    days.shiftSpecDay(startDate);
    days.getDate().setHours(0,0,0,0);
    let colsToAdd = 0;
    while (days.getDate() <= endDate)
    {
        // Write to table
        addRecur();
        let categories = days.getDay().categories;
        let flag_cats = JSON.parse(JSON.stringify(categories));
        $("#dateRow").append(`<th>${formatDateNormally(days.getDate())}</th>`);
        $("#totalRow").append(`<td>${numToCurrency(days.getDay().getSpent())}</td>`);
        $("#goalRow").append(`<td>${numToCurrency(days.getDay().goal)}</td>`);
        for (let i = 0; i < existingCategories.length; i++)
        {
            let cat = existingCategories[i];
            if (categories[cat] != null)
            {
                // Add to exisitng
                let sum = getCatExpense(categories[cat]);
                $(`#category_header_${reference[cat]}`).append(`<td>${numToCurrency(sum)}</td>`);
                flag_cats[cat] = 'f';
            }
            else
            {
                $(`#category_header_${reference[cat]}`).append(`<td>${numToCurrency(0)}</td>`);
            }
        }

        for (let cat in flag_cats)
        {
            if (flag_cats[cat] != 'f')
            {
                // Has not been added through exisitng categories
                
                existingCategories.push(cat);
                reference[cat] = existingCategories.length-1;
                // 1. Create the row
                $("#viewingTable").append(`<tr id="category_header_${reference[cat]}"><td>${cat}</td></tr>`);
                // 2. Fill with 0
                for (let i = 0; i < colsToAdd; i++)
                {
                    $(`#category_header_${reference[cat]}`).append("<td>$0.00</td>");
                }
                // 3. Annex spec value
                $(`#category_header_${reference[cat]}`).append(`<td>${numToCurrency(getCatExpense(categories[cat]))}</td>`);
            }
        }


        days.shiftNextDay();
        days.getDate().setHours(0,0,0,0);
        colsToAdd++;
    }

}

function getCatExpense(transactionArray)
{
    let sum = 0;
    for (let i = 0; i < transactionArray.length; i++)
    {
        sum += transactionArray[i].amount;
    }
    return sum;
}


function downloadCsv()
{
    let date1 = document.getElementById("date1").value;
    let date2 = document.getElementById("date2").value;
    if (date1 == "" || date2 == "")
    {
        alert("Must select a date!");
        return;
    }
    renderTable();

        var csv = [];
        var rows = document.querySelectorAll("table tr");
        
        for (var i = 0; i < rows.length; i++) {
            var row = [], cols = rows[i].querySelectorAll("td, th");
            
            for (var j = 0; j < cols.length; j++) 
                row.push(cols[j].innerText);
            
            csv.push(row.join(","));        
        }
    
        // Download CSV file
        downloadCSV(csv.join("\n"), `SimplyBudget_[${formatDateDot(date1)} - ${formatDateDot(date2)}].csv`);
}

function downloadCSV(csv, filename) {
    var csvFile;
    var downloadLink;

    // CSV file
    csvFile = new Blob([csv], {type: "text/csv"});

    // Download link
    downloadLink = document.createElement("a");

    // File name
    downloadLink.download = filename;

    // Create a link to the file
    downloadLink.href = window.URL.createObjectURL(csvFile);

    // Hide download link
    downloadLink.style.display = "none";

    // Add the link to DOM
    document.body.appendChild(downloadLink);

    // Click download link
    downloadLink.click();
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

function formatDateDot(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [day, month, year].join('.');
}

function mdlUpdates()
{

}

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
    runMDL();
    formatScreen(html_content);

    /*--------------- ASIM FUNCTIONS ----------------*/
    window.addEventListener('resize', function () {
        if (!mobile)
        {
            formatScreen(html_content);
        }
    });

});

