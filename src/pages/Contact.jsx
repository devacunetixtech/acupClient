import React from "react";
import Button from "../components/Button";

const Contact = () => {
    const test1 = ()=>{
        alert("Get Out")
    }
        const test2 = ()=>{
        alert("Get In")
    }
        const test3 = ()=>{
        alert("Get In & Out")
    }

  return (
    <div className="flex gap-4 p-6">
      <Button title="Get Out" color="bg-green-500 hover:bg-green-600" test={test1}/>
      <Button title="Get In" color="bg-blue-500 hover:bg-blue-600" test={test2}/>
      <Button title="Get In & Out" color="bg-yellow-500 hover:bg-yellow-600 text-black" test={test3}/>
    </div>
  );
};

export default Contact;
