﻿using Newtonsoft.Json;
using Rezervacija_Avio_Karata.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Reflection;
using System.Web;
using System.Web.Http;
using System.Web.Routing;

namespace Rezervacija_Avio_Karata.Controllers
{
    [RoutePrefix("api")]
    public class UserController : ApiController
    {
        [HttpPost]
        [Route("RegisterUser")]
        public IHttpActionResult RegisterUser(User user)
        {
            string content = File.ReadAllText(Path.Combine(HttpRuntime.AppDomainAppPath + "App_Data/Users.txt"));
            List<User> users = JsonConvert.DeserializeObject<List<User>>(content) ?? new List<User>();
            var exsists = users.Find(x=> x.Username == user.Username);
            if (exsists != null)
            {
                return BadRequest("User with username \"" + user.Username + "\" already exist!");
            }

            string[] dateTime = user.DateOfBirth.Split(' ');
            user.DateOfBirth = dateTime[0];

            users.Add(user);
            content = JsonConvert.SerializeObject(users, Formatting.Indented);
            File.WriteAllText(Path.Combine(HttpRuntime.AppDomainAppPath + "App_Data/Users.txt"), content);
            return Ok();
        }

        [HttpPost]
        [Route("LoginUser")]
        public IHttpActionResult LoginUser(User model)
        {
            string content = File.ReadAllText(Path.Combine(HttpRuntime.AppDomainAppPath, "App_Data", "Users.txt"));
            List<User> users = JsonConvert.DeserializeObject<List<User>>(content) ?? new List<User>();
            var user = users.Find(u => u.Username.Equals(model.Username));

            if (user == null)
            {
                return BadRequest("User with username \"" + model.Username + "\" doesn't exist!");
            }

            if (user.Password != model.Password)
            {
                return BadRequest("Incorrect password");
            }

            User current = (User)HttpContext.Current.Session["user"];
            if (current != null && current.Username == model.Username)
            {
                return BadRequest("User already logged in");
            }

            HttpContext.Current.Session["user"] = user;
            return Ok(new { message = $"{model.Username} successfully logged in" });
        }

        [HttpGet]
        [Route("SignOut")]
        public IHttpActionResult SignOut()
        {
            HttpContext.Current.Session["user"] = null;
            return Ok();
        }

        [HttpGet]
        [Route("GetUserRole")]
        public string GetUserRole()
        {
            User user = (User)HttpContext.Current.Session["user"];
            if(user == null)
            {
                return "";
            }
            return user.Role;
        }

        [HttpGet]
        [Route("GetCurrentUser")]
        public User GetCurrentUser()
        {
            return (User)HttpContext.Current.Session["user"];
        }


        [HttpGet]
        [Route("GetAllUsers")]
        public List<User> GetAllUsers()
        {
            string content = File.ReadAllText(Path.Combine(HttpRuntime.AppDomainAppPath + "App_Data/Users.txt"));
            List<User> users = JsonConvert.DeserializeObject<List<User>>(content) ?? new List<User>();
            return users;
        }

        //NIJE GOTOVO PRVO MORAM REZERVACIJE I REVIEW DA URADIM JER KAD SE PROMENI USERNAME MORACE I TAMO DA SE MENJA

        [HttpPut]
        [Route("EditProfile")]
        public IHttpActionResult EditProfile(User user,string oldUsername)
        {
            
            if (user.Username != oldUsername)
            {
                if (UsernameExsits(user.Username))
                {
                    return BadRequest("User with username " +  user.Username + " already exsits");
                }
                ChangeUsernameInReviewFile(oldUsername,user.Username);
                ChangeUsernameInReservationFile(oldUsername,user.Username);

            }
            string content = File.ReadAllText(Path.Combine(HttpRuntime.AppDomainAppPath + "App_Data/Users.txt"));
            List<User> users = JsonConvert.DeserializeObject<List<User>>(content) ?? new List<User>();
            for (int i = 0; i < users.Count(); i++)
            {
                if (users[i].Username == oldUsername)
                {
                    foreach (Reservation reservation in users[i].Reservations)
                    {
                        reservation.User = user.Username;
                        user.Reservations.Add(reservation);
                    }
                    user.Role = users[i].Role;
                    users.RemoveAt(i);
                    users.Insert(i, user);
                }
            }

            HttpContext.Current.Session["user"] = user;
            content = JsonConvert.SerializeObject(users, Formatting.Indented);
            File.WriteAllText(Path.Combine(HttpRuntime.AppDomainAppPath + "App_Data/Users.txt"), content);
            return Ok();
        }

        private bool UsernameExsits(string username)
        {
            string content = File.ReadAllText(Path.Combine(HttpRuntime.AppDomainAppPath + "App_Data/Users.txt"));
            List<User> users = JsonConvert.DeserializeObject<List<User>>(content) ?? new List<User>();
            foreach (User user in users)
            {
                if (user.Username == username)
                {
                    return true;
                }
            }
            return false;
        }

        private void ChangeUsernameInReviewFile(string oldUsername, string username)
        {
            string content = File.ReadAllText(Path.Combine(HttpRuntime.AppDomainAppPath + "App_Data/Reviews.txt"));
            List<Review> reviews = JsonConvert.DeserializeObject<List<Review>>(content) ?? new List<Review>();
            foreach (Review review in reviews)
            {
                if (review.Reviewer == oldUsername)
                {
                    review.Reviewer = username;
                }
            }
            content = JsonConvert.SerializeObject(reviews, Formatting.Indented);
            File.WriteAllText(Path.Combine(HttpRuntime.AppDomainAppPath + "App_Data/Reviews.txt"), content);
        }

        private void ChangeUsernameInReservationFile(string oldUsername, string username)
        {
            string content = File.ReadAllText(Path.Combine(HttpRuntime.AppDomainAppPath + "App_Data/Reservations.txt"));
            List<Reservation> reservations = JsonConvert.DeserializeObject<List<Reservation>>(content) ?? new List<Reservation>();
            foreach (Reservation reservation in reservations)
            {
                if (reservation.User == oldUsername)
                {
                    reservation.User = username;
                }
            }
            content = JsonConvert.SerializeObject(reservations, Formatting.Indented);
            File.WriteAllText(Path.Combine(HttpRuntime.AppDomainAppPath + "App_Data/Reservations.txt"), content);
        }



    }
}
