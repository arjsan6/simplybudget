let mobile = false;
if( /Android|webOS|iPhone|iPad|Mac|Macintosh|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
   mobile = true;
 }


// Displays loading feature
function configureLoading()
{
    let view = document.getElementById("boundingBox");
    let posInfo = view.getBoundingClientRect();
    document.getElementById("overlay-black-loading").style = `width: ${posInfo.width}px; height: ${posInfo.height}px;`;
    let spinnerDimensions;
    if (posInfo.width > posInfo.height)
    {
        spinnerDimensions = posInfo.height / 2;
    }
    else
    {
        spinnerDimensions = posInfo.width / 2;
    }
    document.getElementById("loadingSpinner").style =  `width: ${spinnerDimensions}px; height: ${spinnerDimensions}px; left: ${($(document).width()-spinnerDimensions)/2}px; top: ${($(document).height()-spinnerDimensions)/2}px`;
}

function timeLoading(time)
{
    configureLoading();
    setTimeout(stopLoading, time);
}

// Turns off loading feature
function stopLoading()
{
    document.getElementById("loadingSpinner").style = "display: none";
    document.getElementById("overlay-black-loading").style = "display: none";
}

// Formats screen size
function formatScreen(html_content)
{
    timeLoading(300);
    divId = "viewWindow";
    let screenRatio = window.screen.height/window.screen.width;
    if (screenRatio < 1)
    {
        let body = document.getElementById("bodyDiv");
        body.style = "background-color: rgba(205, 227, 255, 0.5);display: flex; align-items: center; justify-content: center;";
        body.innerHTML = `<style>
        .demo-card-wide.mdl-card {
          width: 512px;
        }
        .demo-card-wide > .mdl-card__title {
          color: #fff;
        }
        .demo-card-wide > .mdl-card__menu {
          color: #fff;
        }
        </style>
        
        <div class="demo-card-wide mdl-card mdl-shadow--3dp">
          <div class="mdl-card__supporting-text" id="viewWindow" style="margin: 0; padding: 0;height: 90vh"></div>`;
        document.getElementById(divId).innerHTML = html_content;
    }
    else
    {
        let body = document.getElementById("bodyDiv");
        body.removeAttribute("style");
        body.innerHTML = '<div id="viewWindow"></div>';
        document.getElementById(divId).innerHTML = html_content;
    }
    mdlUpdates();
    componentHandler.upgradeDom();
}





$(document).ready(function () {
  $(".mdl-navigation__link").click(function () {
      configureLoading();
      console.log("clicked");
  });
  $('a[title="Hosted on free web hosting 000webhost.com. Host your own website for FREE."]').remove();

});

