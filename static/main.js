fetch('/data')
    .then(function (response) {
        response.json().then(
            function (courseMap) {
                for (const [key, value] of Object.entries(courseMap)) {
                    console.log(key, value);
                }
            }
        )
    });

