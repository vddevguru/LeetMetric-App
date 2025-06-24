document.addEventListener("DOMContentLoaded",function(){
    const searchButton=document.getElementById("search-btn");
    const usernameInput=document.getElementById("user-input");
    const statsContainer=document.querySelector(".stats-container");
    const easyProgressCircle=document.querySelector(".easy-progress");
    const mediumProgressCircle=document.querySelector(".medium-progress");
    const hardProgressCircle=document.querySelector(".hard-progress");
    const easyLabel=document.getElementById("easy-label");
    const mediumLabel=document.getElementById("medium-label");
    const hardLabel=document.getElementById("hard-label");
    const cardStatsContainer=document.querySelector(".stats-card");

    function validateUsername(username){
        if(username.trim()==""){
        alert("Username should not be empty");
        return false;
        }
        const regex = /^[a-zA-Z0-9_-]{1,15}$/;
        const isMatching=regex.test(username);
        if(!isMatching){
            alert("Invalid Username");
        }
        return isMatching;
    }

    async function fetchUserDetails(username){
       
        try{
            searchButton.textContent = "Searching...";
            searchButton.disabled = true;

            // const response = await fetch(url);
            const proxyurl = 'https://proxy.cors.sh/'
            const targeturl='https://leetcode.com/graphql/';
            const myHeaders = new Headers();
            myHeaders.append("content-type","application/json");

            const graphql = JSON.stringify({
                query:"\n    query userSessionProgress{$username: String!}{\n allQuestionsCount {\n difficulty\n  count\n }\n matchedUser{username: $username} {\n   submitStats {\n   acSubmissionNum {\n  difficulty\n  count\n  submissions\n   }\n  totalSubmissionNum {\n  difficulty\n   count\n    submissions\n  }\n  }\n  }\n}\n    ",
                variables:{"username": `${username}`}
            })
            const requestOptions = {
                method:"POST",
                headers:myHeaders,
                body:graphql,
                redirect:"follow"
            };

            const response=await fetch(proxyurl+targeturl,requestOptions);
            if(!response.ok){
                throw new Error("Unable to fetch the User details");
            }
            const parseData = await response.json();
            console.log("Logging data:",parseData);

            displayUserData(parseData);

        }
        catch(error){
            statsContainer.innerHTML = `<p>${error.message}</p>`
        }
        finally{
            searchButton.textContent = "Search";
            searchButton.disabled = false;

        }
    }
    function updateProgress(solved,total,label,circle){
        const progressDegree = (solved/total)+100;
        circle.style.setProperty("--progress-degree",`${progressDegree}%`);
        label.textContent = `${solved}/${total}`;
    }

    function displayUserData(parseData){
        const totalQues = parseData.data.allQuestionsCount[0].count;
        const totalEasyQues = parseData.data.allQuestionsCount[1].count;
        const totalMediumQues = parseData.data.allQuestionsCount[2].count;
        const totalHardQues = parseData.data.allQuestionsCount[3].count;

        const solvedTotalQues = parseData.data.matchedUser.submitStats.acSubmissionNum[0].count;
        const solvedTotalEasyQues = parseData.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const solvedTotalMediumQues = parseData.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const solvedTotalHardQues = parseData.data.matchedUser.submitStats.acSubmissionNum[3].count;

        updateProgress(solvedTotalEasyQues, totalEasyQues,easyLabel,easyProgressCircle);
        updateProgress(solvedTotalMediumQues, totalMediumQues,mediumLabel,mediumProgressCircle);
        updateProgress(solvedTotalHardQues, totalHardQues,hardLabel,hardProgressCircle);
        
        const cardData = [{label:"Overall Submissions", value:parseData.data.matchUser.submitStats.totalSubmissionNum[0].submissions},
        {label:"Overall Easy Submissions", value:parseData.data.matchUser.submitStats.totalSubmissionNum[0].submissions},
        {label:"Overall Medium Submissions", value:parseData.data.matchUser.submitStats.totalSubmissionNum[0].submissions},
        {label:"Overall Hard Submissions", value:parseData.data.matchUser.submitStats.totalSubmissionNum[0].submissions},
    ];
    console.log("card data",cardData);

    cardStatsContainer.innerHTML = cardData.map(
        data =>
            `<div class="card">
            <h4>${data.label}</h4>
            <p>${data.value}</p>
            </div>`
            
    ).join("")
    }


    searchButton.addEventListener('click',function(){
        const username= usernameInput.value;
        console.log("Logging username",username);
        if(validateUsername(username)){
            fetchUserDetails(username);

        }

    })
    
})