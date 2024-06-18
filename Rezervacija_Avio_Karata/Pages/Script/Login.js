function Login(event) {
    event.preventDefault(); 

    let form = $("#loginForm");
    let data = convertFormToJSON(form);

    $.ajax({
        url: "/api/LoginUser",
        type: "POST", 
        data: JSON.stringify(data),
        contentType: "application/json", 
        success: function (response) {
            window.location.href = "Passenger.html";
            
        },
        error: function(xhr) {
            var errorMessage = xhr.responseJSON ? xhr.responseJSON.Message : "An error occurred";
            $('#loginToast .toast-body').text(errorMessage);
            $('#loginToast').removeClass('text-bg-success').addClass('text-bg-danger');
            var toastEl = new bootstrap.Toast($('#loginToast'));
            toastEl.show();
        }
    });
}

function convertFormToJSON(form) {
    const array = $(form).serializeArray(); // Encodes the set of form elements as an array of names and values.
    const json = {};
    $.each(array, function () {
        json[this.name] = this.value || "";
    });
    return json;
}