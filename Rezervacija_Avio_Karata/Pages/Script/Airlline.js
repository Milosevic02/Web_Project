
function LoadAirllines(role) {
    if(role == "Admin"){
        var searchValue = $("#searchInput").val();
        var sortBy = $("input[name='sortOption']:checked").val();
    
        var filter = {
            SearchValue: searchValue,
            SortBy: sortBy
        };
        $.ajax({
            url: "/api/FilterAirlines",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(filter),
            success: function (data) {
                displayAirlines(data);
            },
            error: function (error) {
                console.log("Error filtering airlines:", error);
            }
        });
    }else{
        $.get("/api/GetAllAirllines",function(data){

            AirllineCards(data);
        })
    }

    
}

function displayAirlines(airlines) {
    let table = '<table class="table table-striped table-hover table-bordered fs-5"><thead><tr><th scope="col">#</th><th scope="col">Name</th><th scope="col">Address</th><th scope="col">Contact Info</th><th scope="col">Edit</th><th scope="col">Delete</th></tr></thead><tbody>';

    let counter = 0;
    airlines.forEach(function (airline) {
        counter++;
        let row = '<td>' + counter.toString() + '</td>';
        row += '<td>' + airline.Name + '</td>';
        row += '<td>' + airline.Address + '</td>';
        row += '<td>' + airline.ContactInfo + '</td>';
        row += '<td class="text-center">  <button onclick="GetAirlineInfo(\'' + airline.Name + '\', \'Admin\')" type="button" class="btn btn-warning text-dark" data-bs-toggle="modal" data-bs-target="#editAirllineModal"><i class="fas fa-pen"></i> Edit</button></td>';
        row += '<td class="text-center">   <button onclick="AddIdToDeleteModal(\'' + airline.Name + '\')" type="button" class="btn btn-danger text-light" data-bs-toggle="modal" data-bs-target="#deleteModal"><i class="fas fa-trash"></i> Delete</button></td>';

        table += '<tr>' + row + '</tr>';
    });

    table += '</tbody></table>';
    $('#airllineTable').html(table);
}

function Reset() {
    $("#searchInput").val("");
    $("input[name='sortOption']").prop("checked", false);
    $("#searchByName").prop("checked", true); // Postavlja radio dugme za "Name" na checked

    LoadAirllines('Admin');
}


function AirllineCards(data){
    let card = '<div class="row">';
    for(airlline in data){
        card += '<div class="card p-3 sec-color text-light" style="width: 22rem;margin-bottom:50px !important;margin-left:80px !important"><div class="card-body">';
        card += '<h5 class="card-title">'+ data[airlline].Name + '</h5><div class="form-group"><label for="address" class="sec-color text-light">Address:</label>';
        card += '<span id="address" class="form-control sec-color text-light" readonly>' + data[airlline].Address + '</span></div>';
        card += '<div class="form-group"><label for="contact" class="sec-color text-light">Contact Info:</label>'
        card += '<span id="contact" class="form-control sec-color text-light" readonly>' + data[airlline].ContactInfo + '</span></div></div><div class="card-body view-btn">';
        card += '<button onclick="GetAirlineInfo(\'' + data[airlline].Name + '\', \'Passenger\')" type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#airllineModal"><i class="fas fa-eye"></i> View Airline</button></div></div>'
    }
    card += '</div>';
    $("#airllineCard").html(card);
}



function AddIdToDeleteModal(airlineId){
    $('#deleteAirlineId').val(airlineId)
}

function DeleteAirline(){
    let id = $('#deleteAirlineId').val();
    $.ajax({
        url: '/api/DeleteAirline?name=' + id,
        type: 'DELETE',
        success: function () {
            LoadAirllines("Admin");
            $('#deleteModal').modal('hide');
            $('#AirllinesToast .toast-body').text('Airlline deleted successfully.');
            $('#AirllinesToast').removeClass('text-bg-danger').addClass('text-bg-success');
            var toastEl = new bootstrap.Toast($('#AirllinesToast'));
            toastEl.show();

        },
        error:function(xhr){
            var errorMessage = xhr.responseJSON ? xhr.responseJSON.Message : "An error occurred";

            $('#deleteModal').modal('hide');
            $('#AirllinesToast .toast-body').text(errorMessage);
            $('#AirllinesToast').removeClass('text-bg-success').addClass('text-bg-danger');
            var toastEl = new bootstrap.Toast($('#AirllinesToast'));
            toastEl.show();
        }
    });
}

function AddAirlline(event){
    event.preventDefault(); 

    let form = $("#addAirlineForm");
    let data = convertFormToJSON(form);
    
    $.ajax({
        url: "/api/AddAirlline",
        type: "POST", 
        data: JSON.stringify(data),
        contentType: "application/json", 
        success: function (result) {
            console.log("success", result);
            window.location.href = "AirllineAdmin.html";
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log("error", xhr.responseText);
            var errorToast = new bootstrap.Toast(document.getElementById('errorToast'));
            errorToast.show();
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

function GetAirlineInfo(airlineName,role){
    $.get('/api/GetAirlineDetails?name=' + airlineName + '&role=' + role,function(airllineDetails){
        if(role === "Admin"){
            $('#editAirlineId').val(airllineDetails.Name);
            $('#name').val(airllineDetails.Name);
            
            $('#address').val(airllineDetails.Address);
            $('#contactInfo').val(airllineDetails.ContactInfo);
        }else{
            $('#name').text(airllineDetails.Name);
            $('#adress').text(airllineDetails.Address);
            $('#contactInfo').text(airllineDetails.ContactInfo);
        }
        

        if(airllineDetails.Reviews.length > 0){
            let reviewes = airllineDetails.Reviews;
            LoadReviewCard(reviewes);
        }else{
            $('#reviewContainer').html('<p>No reviews available.</p>');

        }
    });
}
function LoadReviewCard(reviews) {
    let reviewCard = "";
    reviews.forEach(function(review) {
        reviewCard += `
            <div class="card mb-3">
                <h5 class="card-header">${review.Reviewer}</h5>
                <div class="card-body">
                    <h5 class="card-title fw-bold">${review.Title}</h5>
                    <p class="card-text">${review.Description}</p>
                    ${review.Image ? `<img src="${review.Image}" alt="" class="review-img img-fluid mt-2">` : ''}
                </div>
            </div>`;
    });
    $('#reviewContainer').html(reviewCard);
}

function EditAirline(event){
    event.preventDefault();
    let form = $('#editAirlineForm');
    let data = convertFormToJSON(form);
    data = JSON.stringify(data);
    let id = $('#editAirlineId').val();

    $.ajax({
        url:"/api/EditAirline?oldName=" + id,
        type:"PUT",
        data:data,
        contentType:"application/json",
        success:function(){
            $('#editAirllineModal').modal('hide');
            LoadAirllines("Admin");
            $('#AirllinesToast .toast-body').text('Airlline edited successfully.');
            $('#AirllinesToast').removeClass('text-bg-danger').addClass('text-bg-success');
            var toastEl = new bootstrap.Toast($('#AirllinesToast'));
            toastEl.show();
        } ,
        error:function(xhr){
            var errorMessage = xhr.responseJSON ? xhr.responseJSON.Message : "An error occurred";
            $('#editAirllineModal').modal('hide');
            $('#AirllinesToast .toast-body').text(errorMessage);
            $('#AirllinesToast').removeClass('text-bg-success').addClass('text-bg-danger');
            var toastEl = new bootstrap.Toast($('#AirllinesToast'));
            toastEl.show();
        }
    })
}