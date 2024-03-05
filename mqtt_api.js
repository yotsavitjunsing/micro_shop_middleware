const express = require('express');
const mqtt = require('mqtt');
const mysql = require('mysql');
let cors = require('cors');
const app = express();
const port = 3333;
app.use(cors());
let costall_send={
 "cost":0
}
let value_p;
let value=0;
let data_send;
let hop = 0;
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'shoping',
  port:'3306',
});
 
db.connect((err) => {
  if (err) {
    console.error('MySQL connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database');
});
 
// MQTT Connection
const client = mqtt.connect("mqtt://localhost");
 
client.on("connect", () => {
  client.subscribe("presence", (err) => {
    if (!err) {
      // client.publish("presence", "Hello mqtt");
    }
  });
});
 
client.on("message", (topic, message) => {
  let message_slice =message.toString().substring(0,13);
  
  db.query('UPDATE product SET product.reamaining=product.reamaining-1 WHERE product.p_id =? ',[message_slice],(err,result) =>{
 
    if(err)
      {
        console.log(err);
      }
    else
      {
        console.log(result);
      }
}
 
)
db.query('SELECT product.name_p,product.cost FROM product WHERE product.p_id=? ',[message_slice],(err,result) =>{
       
      if(err)
          {
            console.log(err);
          }
    else
          {
            console.log(result);
            costall_send = JSON.parse(JSON.stringify(result));
           
            data_send=JSON.parse(JSON.stringify(result));
            console.log((costall_send[0].cost));
           
            
            
            
            if (data_send[0] && typeof data_send[0].cost === 'number') {
             hop += data_send[0].cost;
             console.log("hop ="+hop);
            } else {
             console.error('Invalid value for cost in costObject:', costObject);
            }
            console.log(costall_send);
            value_p=String(data_send[0].cost)
            value = String(hop);
            client.publish("calculate",value);
            client.publish("name",data_send[0].name_p);
            client.publish("value",value_p);
            
          }
          
}
 
)
 
  console.log(message_slice);
  console.log(message.toString().length);
  console.log(message.toString());
});
app.get('/showdata',(req,res) =>{
  if(value===0)
  {
     return res.json({status:"not data"});
  }
  else{
    res.json({calculate:value,name:data_send[0].name_p,cost:value_p,status:"success"})
  }
app.get('/setdata',(req,res)=>{
   value_p=0;
 value=0;
 data_send='';
 hop = 0;
 res.json({status:"success"});
}) 

})
app.get('/product', (req, res) => {
  db.query('SELECT * FROM order_radius', (err, results) => {
    if (err) {
      // Send error status code along with the error message
      res.status(500).json({ error: err.message });
    } else {
      // Send success status code along with the results
      res.status(200).json({ status: 'success', data: results });
    }
  });
});
app.get('/type_product/:id', (req, res) => {
  let id =req.params.id
  db.query('CALL get_product_type(?)',[id], (err, results) => {
    if (err) {
      // Send error status code along with the error message
      res.status(500).json({ error: err.message });
    } else {
      const filteredResults = results.slice(0, 1);
      res.status(200).json({ status: 'success', data: filteredResults });
    }
  });
});
 
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});