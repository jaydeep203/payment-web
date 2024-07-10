const express = require("express");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const {User} = require("../db");
const { authMiddleware } = require("../middleware");
const dotenv = require("dotenv");

dotenv.config();


const router = express.Router();

const signupSchema = zod.object({
    username: zod.string().email(),
    password: zod.string().min(4),
    firstName: zod.string(),
    lastName: zod.string(),
});

const signinSchema = zod.object({
    username: zod.string().email(),
    password : zod.string().min(4)
});

router.post("/signup", async(req, res)=> {

    const body = req.body;

    const {success} = signupSchema.safeParse(body);

    if(!success){
        return res.status(411).json({
            msg:"Email already take / Incorrect Inputs."
        });
    }

    const user = User.findOne({
        username:body.username
    });

    if(user._id){
        return res.status(411).json({
            msg:"email already taken / Incorrect Inputs."
        });
    }

    const dbUser = await User.create(body);

    const userId = dbUser._id;

    const token = jwt.sign({
        userId
    }, process.env.JWT_SECRET);

    

    res.json({
        msg:"User created successfully.",
        token:token
    });

})

router.post("/signin", async(req, res) => {

    const body = req.body;

    const {success} = signinSchema.safeParse(body);

    if(!success){
        return res.status(411).json({
            msg:"Email already take / Incorrect Inputs."
        });
    }

    const user = await User.findOne({
        username:body.username
    });

    if(!user){
        return res.status(411).json({
            msg:"email already taken / Incorrect Inputs."
        });
    }

    const userId = user._id;

    const token = jwt.sign({
        userId
    }, process.env.JWT_SECRET);

    

    res.json({
        msg:"User created successfully.",
        token:token
    });


});

const updateBody = zod.object({
    password: zod.string().min(4).optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional()
});

router.put("/", authMiddleware, async(req, res) => {
    try{
        const {success} = updateBody.safeParse(req.body);
        if(!success){
            res.status(411).json({
                msg: "Error while updating information."
            });
        }
        

        const userUp = await User.updateOne({
            _id:req.userId
        },
            req.body
        );

        res.json({
            msg:"Updated successfully."
        });

    } catch(err) {
        console.log(err);
        return res.json({
            msg:"error",
            err
        })
    }

});

router.get("/me", async(req, res) => {
    try{
        const authHeader = req.headers.authorization;

        if(!req.headers.authorization || !authHeader.startsWith("Bearer ")){
            return res.status(403).json({
                success:false
            });
        }

        const token = authHeader.split(" ")[1];

        if(!token){
            return res.status(400).json({
                success:false
            });
        }

        
         const userId = jwt.verify(token, process.env.JWT_SECRET);
        

        if(!userId || !userId.userId){
            return res.status(400).json({
                success:false
            });
        }

        const user = await User.findOne({
            _id:userId.userId
        });


        if(!user || !user._id){
            return  res.status(400).json({
                success:false
            })
        }

        return res.status(200).json({
            success:true
        });

    }catch(err) {
        return res.json({
            success:false
        })
    }


});

router.get("/bulk", async(req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    });
});


module.exports = router;