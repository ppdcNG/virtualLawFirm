$(document).ready(function () {
    displayUser();
});

let width = "200";

document.querySelector("#mySidenav").style.width = width;
document.querySelector("#main").style.marginLeft = width;

function openNav() {
    document.querySelector("#mySidenav").style.width = width;
    document.querySelector("#main").style.marginLeft = width;
    document.querySelector("#menuIcon").style.display = "none";
}

function closeNav() {
    document.querySelector("#mySidenav").style.width = "0";
    document.querySelector("#main").style.marginLeft = "0";
    document.querySelector("#menuIcon").style.display = "block";
}

function sideNav(x) {
    if (x.matches) {
        document.querySelector("#mySidenav").style.width = "0";
        document.querySelector("#main").style.marginLeft = "0";
        document.querySelector("#menuIcon").style.display = "block";
    } else {
        document.querySelector("#mySidenav").style.width = width;
        document.querySelector("#main").style.marginLeft = width;
        document.querySelector("#menuIcon").style.display = "none";
    }
}

let x = window.matchMedia("(max-width: 700px)")
sideNav(x)
x.addListener(sideNav)


const displayUser = () => {
    let isLoggedin = `
        <li class="nav-item avatar dropdown">
            <a class="nav-link dropdown-toggle" id="navbarDropdownMenuLink-55" data-toggle="dropdown"
            aria-haspopup="true" aria-expanded="false">
            <img src='https://images.pexels.com/photos/399772/pexels-photo-399772.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' class="rounded-circle z-depth-0"
                width="50" />
            </a>
            <div class="dropdown-menu dropdown-menu-lg-right dropdown-secondary"
            aria-labelledby="navbarDropdownMenuLink-55">
                <a class="dropdown-item" href="#">Go to Dashboard</a>
                <a class="dropdown-item" href="#">My List</a>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item" href="#">My Certificates</a>
            </div>
        </li>

        <li class="nav-item">
            <a class="nav-link waves-effect waves-light" href="{{ABS_PATH}}logout">
                <i class="fas fa-sign-out-alt"></i> Logout
            </a>
        </li>
    `;
    let isNotLoggedIn = `<li><a class="btn btn-default" href="/client/login2">Login</a></li>`;

    try {
        if (localStorage.getItem("uid")) {
            $("#isLoggedin").html(isLoggedin);
        } else {
            $("#isLoggedin").html(isNotLoggedIn);
        }
    } catch (err) {
        console.log("error", err)
    }
}
