using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using DatingApp.API.Data;
using DatingApp.API.DTOs;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace DatingApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : Controller
    {
        private readonly IAuthRepository _repo;
        private readonly IConfiguration _config;

        private readonly IMapper _mapper;

        public AuthController(IAuthRepository repo, IConfiguration config, IMapper mapper)
        {
            _config = config;
            _mapper = mapper;
            _repo = repo;
        }
       [HttpPost("register")]
       public async Task<IActionResult> Register(UserForRegisterDto userForRegisterDTO)
        {
            //validate request

            userForRegisterDTO.UserName = userForRegisterDTO.UserName.ToLower();
            if (await _repo.UserExists(userForRegisterDTO.UserName))
                return BadRequest("UserName is already exists");

            var userToCreate = _mapper.Map<User>(userForRegisterDTO);
            
            var createdUser = await _repo.Register(userToCreate, userForRegisterDTO.Password);

            var userToReturn = _mapper.Map<UserForDetailedDto>(createdUser);

            return CreatedAtRoute("GetUser", new { controller = "Users", id = createdUser.Id}, userToReturn);

        }
        [HttpPost("login")]
        public async Task<IActionResult> Login(UserForLoginDto userForLoginDTO)
        {
            // throw new Exception("no access");
            var userFromRepo = await  _repo.Login(userForLoginDTO.UserName.ToLower(), userForLoginDTO.Password);

            if (userFromRepo == null) return BadRequest("Unauthorized");

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier,userFromRepo.Id.ToString()),
                new Claim(ClaimTypes.Name, userFromRepo.UserName),
               
            };

            //var x =  User.Identity as ClaimsIdentity;
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config.GetSection("AppSettings:Token").Value));
           
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);
            
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddDays(1),
                SigningCredentials = creds
            };
            
            var tokenHandler = new JwtSecurityTokenHandler();

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var user = _mapper.Map<UserForListDto>(userFromRepo);
            return Ok( new {
                token = tokenHandler.WriteToken(token),
                user
            });
        }

    }
}
