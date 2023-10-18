var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const session = require('express-session');
var logger = require('morgan');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const userTypes = {
  student : 'Student',
  admin : 'Admin',
  driver : 'Driver'
}

let driver  = {lat: null, long:null } 
let users = []
let cars = []

let rideRequests = []

const rideStatus = {
  requested : 'Requested', 
  opened : 'Opened',
  accepted : 'Accepted', 
  closed : 'Closed'
}

const vehicleAvailStat = {
  available : 'Available',
  booked : 'Booked',
}

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouterRegister = require('./routes/register');
var authRouterLogin = require('./routes/login');

let adminUser = {
  id : 1,
  drivercode : 'USER100',
  name: 'Cab ',
  surname: 'TeJayy',
  usertype:userTypes.admin,
  email: 'admin@infinite.com',
  password: 'admin'
}
let StudentUser = {
  id : 2,
  drivercode : 'None',
  name: 'Andile',
  phone: '0723074089',
  surname: 'Masilela',
  usertype: userTypes.student,
  email: 'student@infinite.com',
  password: 'student'
}
let StudentUser2 = {
  id : 3, 
  drivercode : 'None',
  name: 'Victor',
  surname: 'Mahluza',
  usertype: userTypes.student,
  email: 'victor@infinite.com',
  password: '123'
}
let DriverUser1 = {
  id : 4,
  drivercode : 'USER200',
  name: 'AndileAs Driver',
  surname: 'Masilela',
  phone: '0723074089',
  usertype: userTypes.driver,
  email: 'driver@infinite.com',
  password: 'driver2'
}
let DriverUser2 = {
  id : 5,
  drivercode : 'USER201',
  name: 'Vic as Driver',
  surname: 'Masilela',
  usertype: userTypes.driver,
  phone :"0723074089",
  email: 'driver2@infinite.com',
  password: 'student'
}



let adminCar = {
  id : 1,
  name : 'Mercedes Sprinter',
  condition : 'Good',
  dest_id : 2,
  status : 'booked',
  drivercode : 'USER100',
  plate : 'GDB 203 MP',
  seats : 15,
  imageUrl: 'images/vehicle1.jpg'
}
let userCar = {
  id : 2,
  name : 'Golf 5 X9',
  condition : 'Good',
  status : 'booked',
  dest_id : 1,
  drivercode : 'USER200',
  plate : 'MAH 200 MP',
  seats : 15,
  imageUrl: 'images/vehicle2.jpg'
}
let destination_locations = [];

const demLocation = {
  id: 1,
  name: 'Res 1',
  addressline1: '123 Main Street',
  addressline2: 'Apt 4B',
  town_city: 'Springfield',
  province: 'IL',
  latitude: 39.7817,   // Replace with actual latitude value
  longitude: -89.6501  // Replace with actual longitude value
};
const demLocation1 = {
  id: 2,
  name: 'Res 2',
  addressline1: '456 Oak Avenue',
  addressline2: 'Unit 8',
  town_city: 'Cedarville',
  province: 'CA',
  latitude: 36.7477,   // Replace with actual latitude value
  longitude: -119.7724 // Replace with actual longitude value
};
const demLocation2 = {
  id: 3,
  name: 'Res 3',
  addressline1: '789 Elm Street',
  addressline2: '',
  town_city: 'Mapleton',
  province: 'NY',
  latitude: 42.3304,   // Replace with actual latitude value
  longitude: -77.6239  // Replace with actual longitude value
};

destination_locations.push(demLocation);
destination_locations.push(demLocation1);
destination_locations.push(demLocation2);

console.log(destination_locations)

users.push(adminUser);
users.push(StudentUser);
users.push(StudentUser2);
users.push(DriverUser1);
users.push(DriverUser2);
cars.push(adminCar);
cars.push(adminCar);
cars.push(userCar);

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}))

const generateSecretKey = () => {
  return crypto.randomBytes(32).toString('hex');
};
app.use(session({
  secret: `${generateSecretKey()}`, // Replace with a secret key of your choice
  resave: false,
  saveUninitialized: true
}));

app.use('/', indexRouter);
app.use('/auth', authRouterRegister);
app.use('/auth', authRouterLogin);

function calculateDistance({ lat: lat1, lon: lon1 }, { lat: lat2, lon: lon2 }) {
  // Radius of the Earth in kilometers
  const earthRadius = 6371; // Approximate value, you can use a more accurate radius if needed

  // Convert latitude and longitude from degrees to radians
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lon1Rad = (lon1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;
  const lon2Rad = (lon2 * Math.PI) / 180;

  // Calculate the differences in latitude and longitude
  const dLat = lat2Rad - lat1Rad;
  const dLon = lon2Rad - lon1Rad;

  // Calculate the distance using the Pythagorean theorem
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadius * c;

  return distance; // Distance in kilometers
}
// START OF RIDE REQUESTS
app.get('/api/ride-request/accept/:req_id', (req, res) => {
  if (req.session.user) {
    const rideRequest = rideRequests.find(ride => parseInt(ride.id) === parseInt(req.params.req_id));
    rideRequest.status = rideStatus.accepted;
    return res.redirect('/home')
  }else{ return res.redirect('/auth/login')}
});
app.get('/forgot-password', (req, res) => res.render("forgot-password.ejs"))
app.post('/reset-password', (req, res) => {
  const email = req.body.email;

  const message = `Password reset requested for ${email}. Implement your logic here.`;

  res.send(message);
});
app.get('/app', (req, res) => res.render("page"))
app.get('/api/ride-request/opened/:req_id', (req, res) => {
  if (req.session.user) {
    const rideRequest = rideRequests.find(ride => parseInt(ride.id) === parseInt(req.params.req_id));
    rideRequest.status = rideStatus.opened;
    res.redirect('/home')
  }else{res.redirect('/auth/login')}
});

app.post('/api/ride-request', (req, res) => {
  const User = req.session.user;
  console.log("New Ride Request Incoming ", req.body)

  if (User.usertype === userTypes.student) {
    const { pickupLocation, destination_id } = req.body;
    let id = rideRequests.length + 1;
    let status = rideStatus.requested;

    const AvailableCarsToSelectedDestination = cars.filter(car => car.dest_id === parseInt(destination_id));

    if (AvailableCarsToSelectedDestination.length > 0) {
      const lastCar = AvailableCarsToSelectedDestination[AvailableCarsToSelectedDestination.length - 1];

      if (lastCar.seats) {
        lastCar.seats = lastCar.seats - 1;

        const destination = destination_locations.find(dest => dest.id === parseInt(destination_id));

        const newRideRequest = {
          id,
          requester: User.id,
          selectedDriverCode: lastCar.drivercode,
          car: lastCar,
          requestDate: new Date(),
          pickupLocation,
          destination,
          status,
          requesterObject: User,
        };

        console.log(newRideRequest);
        rideRequests.push(newRideRequest);
      } else {
        console.error('Seats property is undefined for the last available car.');
      }
    } else {
      console.error('No available cars for the selected destination.');
    }
  }

  res.redirect('/home');
});
app.get('/ride-requests', (req, res) => {
  let UserRideRequests = []
  UserRideRequests=rideRequests
  if (req.session.user){
    let user = req.session.user
    if (user.usertype === userTypes.student){
      UserRideRequests = rideRequests.filter((ride) => parseInt(ride.requester) === user.id)
    }
    if (user.usertype === userTypes.driver){
      console.log('On dRIVER', UserRideRequests)
      UserRideRequests = rideRequests.filter((ride) => ride.selectedDriverCode === user.drivercode)
      console.log('On dRIVER', UserRideRequests)
    }

    numberOfRideRequestToday = UserRideRequests.slice(-4).filter(rideReq =>  {
      const dateMatch = GetCurrentDateMatch() === GetDateMatch(rideReq.requestDate)
      return dateMatch
    }).length;

   return res.render(
      'ride-request',
      {
        user : user,
        UserRideRequests:UserRideRequests,
        numberOfRideRequestToday
      }
    )
  }else{
    console.log('You are not logged in')
    res.redirect('/auth/login'); // Redirect
  }
});
// END OF RIDE REQUESTS

app.post('/api/register', (req, res) => {
  
  console.log(req.body);
  let id = users.length + 1;
  const { drivercode ,name, surname,phone, usertype, email, password } = req.body;
  const newUser = {
    id, drivercode, name, surname, usertype, email, password, phone,lat:null, long:null
  }
  users.push(newUser);
  res.redirect('/auth/login')
});

function findUserByEmailAndPassword(email, password) {
  return users.find(user => user.email === email && user.password === password);
}

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const foundUser = findUserByEmailAndPassword(email, password);
  if (foundUser) {
    // Store user information in the session
    req.session.user = foundUser;
    console.log('Session: ', req.session.user);
    res.redirect('/home'); // Redirect to the dashboard or any other authenticated page
  } else {
    res.render("login",{error:"Invalid Credentials"}); // Redirect back to the login page if login fails
  }
});

app.get('/api/users', (req, res) => {
  res.json(users)
})

app.post('/api/users/update', (req, res) => {
  const User = req.session.user;

  const { name, surname, email, phone } = req.body;

  const userToUpdateIndex = users.findIndex(user => user.id === User.id);

  console.log("Index to Update" , userToUpdateIndex);

  if(userToUpdateIndex !== -1){
    users[userToUpdateIndex].name = name;
    users[userToUpdateIndex].surname = surname;
    users[userToUpdateIndex].email = email;
    users[userToUpdateIndex].phone = phone;
  }

  console.log("After Update" ,users[userToUpdateIndex])
  console.log("All Users", users)
  res.redirect('/profile')
})


app.post('/coordinates', (req, res) => {
  const { latitude, longitude } = req.body;
  
  // You can now use the latitude and longitude values in your server logic
  // For example, you can save them to a database, process them, or respond with some data
  console.log(`Received coordinates: Latitude: ${latitude}, Longitude: ${longitude}`);
driver = {lat:latitude, long:longitude}
  // Respond with a success message
  res.json({ message: 'Coordinates received successfully' });
});
app.post('/coord', (req, res) => {
  const { latitude, longitude } = req.body;
  
  // You can now use the latitude and longitude values in your server logic
  // For example, you can save them to a database, process them, or respond with some data
  console.log(`Received coordinates: Latitude: ${latitude}, Longitude: ${longitude}`);
  req.user.lat = latitude ; 
  req.user.long = longitude ; 
  // Respond with a success message
  res.json({ message: 'Coordinates received successfully' });
});

app.get('/logout', (req, res) => {
  if (req.session.user) {
    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
      }
    });
  }
  res.redirect('/auth/login'); // Redirect
});

app.get('/profile', (req, res) => {

  if (req.session.user) {
    if (req.session.user.usertype === userTypes.student) {
      const UserRideRequests = rideRequests.filter((ride) => parseInt(ride.requester) === req.session.user.id)
      let numberOfRideRequestToday = 0
    let userCars = cars.filter(car => car.drivercode == req.session.user.drivercode)
      if (UserRideRequests){
        const currentDate = new Date()
        numberOfRideRequestToday = UserRideRequests.slice(-4).filter(rideReq =>  {
          const dateMatch = GetCurrentDateMatch() === GetDateMatch(rideReq.requestDate)
          return dateMatch
        }).length;

       return res.render('profile', {
          user : req.session.user,
          userCars : userCars,
          LastRideRequest : UserRideRequests[UserRideRequests.length - 1],
          UserRideRequests : UserRideRequests.slice(0, 5),
          destination_locations,
          numberOfRideRequestToday
        })
        
      }

    } 
    if (req.session.user.usertype === userTypes.driver) {
      const UserRideRequests = rideRequests.filter((ride) => parseInt(ride.requester) === req.session.user.id)
      let numberOfRideRequestToday = 0
    let userCars = cars.filter(car => car.drivercode == req.session.user.drivercode)
      if (UserRideRequests){
        const currentDate = new Date()
        numberOfRideRequestToday = UserRideRequests.slice(-4).filter(rideReq =>  {
          const dateMatch = GetCurrentDateMatch() === GetDateMatch(rideReq.requestDate)
          return dateMatch
        }).length;

        return res.render('profile', {
          user : req.session.user,
          userCars : userCars,
          LastRideRequest : UserRideRequests[UserRideRequests.length - 1],
          UserRideRequests : UserRideRequests.slice(0, 5),
          destination_locations,
          numberOfRideRequestToday
        })
        
      }

    } 
    // let userCars = cars.filter(car => car.drivercode == req.session.user.drivercode)
    // console.log("User cars",userCars);
    // res.render('profile', {
    //   user : req.session.user,
    //   userCars: userCars
    //   UserRideRequests
    // })
  }
  else {
    console.log('You are not logged in')
    res.redirect('/auth/login'); // Redirect
  }
})


function GetDateMatch(dateStr){

  const date = new Date(dateStr)
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');  
  return `${year}-${month}-${day}`

}

function GetCurrentDateMatch(){
  const date = new Date()
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');  
  return `${year}-${month}-${day}`
}

app.get('/home', (req, res) => {
  console.log(cars)
  if (req.session.user) {
    console.log('You are logged in => ' , (req.session.user.usertype === userTypes.admin))
    if (req.session.user.usertype === userTypes.student) {
      const UserRideRequests = rideRequests.filter((ride) => parseInt(ride.requester) === req.session.user.id)
      let numberOfRideRequestToday = 0
      if (UserRideRequests){
        const currentDate = new Date()
        numberOfRideRequestToday = UserRideRequests.slice(-4).filter(rideReq =>  {
          const dateMatch = GetCurrentDateMatch() === GetDateMatch(rideReq.requestDate)
          return dateMatch
        }).length;

        console.log("SJDHJHDSJ",UserRideRequests)
        return res.render('home', {
          user : req.session.user,
          cars : cars,
          LastRideRequest : UserRideRequests[UserRideRequests.length - 1],
          UserRideRequests : UserRideRequests.slice(0, 5),
          destination_locations,
          numberOfRideRequestToday
        })
        
      }

    } 
  
  if (req.session.user.usertype === userTypes.driver){
    console.log("In Driver =>" , req.session.user)
    console.log(rideRequests)
    const UserRideRequests = rideRequests.filter((ride) => {
      console.log(req.session.user.drivercode, ride.selectedDriverCode)
      return req.session.user.drivercode === ride.selectedDriverCode
    })

    const numberOfRideRequestToday = UserRideRequests.length
    return res.render('home-driver', {
      user : req.session.user,
      cars : cars,
      LastRideRequest : UserRideRequests[UserRideRequests-1],
      UserRideRequests :UserRideRequests,
      numberOfRideRequestToday
    })
  } else if (req.session.user.usertype === userTypes.admin){
    console.log("In Admin =>" , req.session.user)
    console.log(rideRequests)
    const UserRideRequests = rideRequests.filter((ride) => {
      console.log(req.session.user.drivercode, ride.selectedDriverCode)
      return req.session.user.drivercode === ride.selectedDriverCode
    })
    const numberOfRideRequestToday = UserRideRequests.length
    for (let car of cars) {
      for (let user of users) {
          if (user.drivercode === car.drivercode) {
            user.car = car
            car.user = user
            console.log(car)
          }
      }
  }
    return res.render('home-admin', {
      user : req.session.user,
      cars : cars,
      users : users,
      LastRideRequest : UserRideRequests[UserRideRequests-1],
      UserRideRequests :UserRideRequests,
      numberOfRideRequestToday
    })
  } else {
    return res.render('home', {
      user : req.session.user,
      cars : cars
    })
  }
  }
  else {
    console.log('You are not logged in')
    res.redirect('/auth/login'); // Redirect
  }
})

app.get('/cars', (req, res) => {

  const User = req.session.user;
  if (User) {
    console.log(User)
    if(User.usertype === userTypes.driver){
      const carsForDriver = cars.filter(car => car.drivercode === User.drivercode)
      console.log("On Driver With: " + carsForDriver)
      res.render('cars', {
      user : req.session.user,
      cars: carsForDriver,
      destination_locations,
      numberOfRideRequestToday : 0
    })
    }
    if(User.usertype === userTypes.admin){
      res.render('cars', {
      user : req.session.user,
      cars: cars,
      numberOfRideRequestToday : 0
    })

    }
  }
  else {
    console.log('You are not logged in')
    res.redirect('/auth/login'); // Redirect
  }
})
app.get('/api/cars', (req, res) => {
  res.send(cars)
})
app.post('/api/cars', (req, res) => {
  
  const User = req.session.user;
  console.log("Adding a car... : ", req.body)
  const { name, plate, destination_id,imageUrl, condition} = req.body

  const destination = destination_locations.find(loc => loc.id === parseInt(destination_id))
  let id = cars.length + 1;
  const newCar = {
    id, name, plate, imageUrl : '/images/vehicle1.jpg', status : vehicleAvailStat.available, condition, drivercode : User.drivercode, destination
  }
  cars.push(newCar);

  res.redirect('/cars')
})
app.get('/users', (req, res) => {
  if (req.session.user) {
    res.render('users', {
      user : req.session.user,
      cars: cars,
      users : users
    })
  }
  else {
    console.log('You are not logged in')
    res.redirect('/auth/login'); // Redirect
  }
})

// catch 404 and forward to error handler


// error handler

app.get('/distance', function(req, res) {

  let a = { lat: driver.lat, lon: driver.long }
  let b = { lat: req.user.lat, lon: req.user.long }
  return calculateDistance(a, b)
})



app.get('/api/cars/delete/:plate', (req, res) => {
  console.log("I am on Delete")
  const plate = req.params.plate;
  // Find the index of the car with the specified plate
  const carIndex = cars.findIndex(car => {
    console.log(car.plate , plate)
    return car.plate === plate
  });

  if (carIndex !== -1) {
    // Car found, remove it from the array
    const deletedCar = cars.splice(carIndex, 1)[0];
    console.log(deletedCar);
    res.json({ success: true, deletedCar });
  } else {
    // Car not found
    res.status(404).json({ success: false, message: 'Car not found' });
  }
});

app.get('/api/users/delete/:name', (req, res) => {
  console.log("I am on Delete")
  const plate = req.params.plate;
  // Find the index of the car with the specified plate
  const carIndex = cars.findIndex(car => {
    console.log(car.plate , plate)
    return car.plate === plate
  });

  if (carIndex !== -1) {
    // Car found, remove it from the array
    const deletedCar = cars.splice(carIndex, 1)[0];
    console.log(deletedCar);
    res.json({ success: true, deletedCar });
  } else {
    // Car not found
    res.status(404).json({ success: false, message: 'Car not found' });
  }
});


app.get('/api/users/:id', (req, res) => {
  const userIdToDelete = parseInt(req.params.id);
  // Find the index of the user with the specif
  const userIndex = users.findIndex(user => user.id === userIdToDelete);

  if (userIndex !== -1) {
    // User found, remove it from the array
    const deletedUser = users.splice(userIndex, 1)[0];
    console.log(deletedUser);
    // res.json({ success: true, deletedUser });
    return res.redirect("/home")
  } else {
    // User not found
    res.status(404).json({ success: false, message: 'User not found' });
  }
});


const port = process.env.PORT || 3000;

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
