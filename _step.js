/**NB: secret key toiri krte>>>require('crypto').randomBytes(64).toString('hex')
 * jwt token toirir step(NB: ekhane order k token k secure kra hoyeche)
 * 1. jwt install
 * 2. jwt req >>> const jwt = require('jsonwebtoken'); 
 * 3.  post api toiri kre client e login form er handler theke inp er email ta pathate hbe
  backend side-------------------------------------
        app.post('/login', async (req, res) => {
            const user = req.body;
            //jwt install kre upore require krte hbe>>> const jwt = require('jsonwebtoken');
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
            res.send({ accessToken })
        })
  client side e login form er handler(Login.js)----------------------------------------
     const handleSubmit = async event => {
        event.preventDefault();
        const email = emailRef.current.value;
        const password = passwordRef.current.value;
        await signInWithEmailAndPassword(email, password);
//ekhane useEffect e axios dei nai, 
        const { data } = await axios.post('http://localhost:5000/login', { email })
        localStorage.setItem('accesstoken', data?.accessToken)
        navigate(from, { replace: true });
    }
 * 4.three no. e post api diye token generate kre localstorage e set krchi, ebar token ta client theke get api diye ene authorize(token use hoyeche kina niscit kra) & verify krte hbe api te use krte hbe>>>
    client(Orders.js)----------------------------------------------------------------------
    .................................................................................................................      notun kaj          eta krle 401,403 dile logout kre login page e niye jabe                                .................................................................................................................
    useEffect(() => {
        const getOrders = async () => {
            const email = user.email;
            const url = `http://localhost:5000/order?email=${email}`;
            // 401,403 error hle logout kre login page e niye try catch kra hoyeche
            try {
                const { data } = await axios.get(url, {
                    headers: {
                        authorization: `Bearer ${localStorage.getItem('accesstoken')}`
                    }
                });
                console.log(data);
                setOrders(data);
            }
            catch (error) {
                console.log(error)
                if (error.response.status === 401 || error.response.status === 403) {
                    signOut(auth);
                    navigate('/login');
                }
            }
        }
        getOrders();
    }, [user])
    ...........................................................................................................
    puran kaj      eta-o same tobe  aager ta orders aanar kaj try te dichilo, catch e logout krchilo,
    ........................................................................................................... 
    const getOrders = async () => {
            const email = user.email;
            const url = `http://localhost:5000/order?email=${email}`;
//get er maddome-o post er moto pathano jai
            const { data } = await axios.get(url, {
                headers: {
                    authorization: `Bearer ${localStorage.getItem('accesstoken')}`
                }
            });
            console.log(data);
            setOrders(data);
        }
        getOrders();
 backend----------------------------------------------------------------------
 work 1..........
 //verifyJWT ta get api er majhe dite hbe
 //ei fn ta somvoboto get api e use hbe, mongo theke data load houyar somoy
 function verifyJWT(req, res, next) {
    const authoHeaders = req.headers.authorization;
//Authorization
    if (!authoHeaders) {
        return res.status(401).send({ massage: 'unauthorize access' })
    }
//verification
    const token = authoHeaders.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ massage: 'forbidden access' });
        }
        console.log('decoded rrr', decoded);
        req.decoded = decoded;
        next();
    })
}
work 2..........
//verifyJWT ta majhe dite hbe
app.get('/order', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            const authoHeaders = req.headers.authorization;
            //query er email & jwt.verify er decoded er email ta mach hle client e orders gulo jabe
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = orderCollection.find(query);
                const orders = await cursor.toArray();
                res.send(orders);
            }
        })
 * 5.arekta bisoy jeta na krle kaj sole jabe ,krle code kom likte hbe::
        src te ekta folder api khulo > sekhane axiosPrivate naame ekta file khulo > nicer dui line koro:       import axios from "axios";
        const axiosPrivate = axios.create({}); >
        > axios-http.com e interceptors theke first box er code copy kre eene likho > axios.interceptors ekhane  axiosPrivate.interceptors kre dao > // Do something before request is sent er neece eta likho::             if(!config.headers.authorization){
        config.headers.authorization=`Bearer ${localStorage.getItem('accesstoken')}` > axiosPrivate export kro:: export default axiosPrivate; >
        > client e jekhane header pathaschi sekhane axios.get na likhe axiosPrivate.get likho > url diye aar headers pathate hbe na (axiosPrivate e pathno hoyeche)
    } >
    > seser deeke function (error) er vtore eta likho >>> if(error.response.status===403){
        //refress token>>> key diye refress token er sahajje arek ta notun token toiri krbe
        //send to the server

    }
        .......pura code deya hlo.....................
 * ****axiosPrivate.js***

        import axios from "axios";

const axiosPrivate = axios.create({});

// Add a request interceptor
axiosPrivate.interceptors.request.use(function (config) {
    // Do something before request is sent
    if (!config.headers.authorization) {
        config.headers.authorization = `Bearer ${localStorage.getItem('accesstoken')}`
    }
    return config;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});

// Add a response interceptor
axiosPrivate.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
}, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    if(error.response.status===403){
        //refress token>>> key diye refress token er sahajje arek ta notun token toiri krbe
        //send to the server

    }
    return Promise.reject(error);
});
export default axiosPrivate;

*****Orders.js******

const { data } = await axios.get(url, {
                    headers: {
                        authorization: `Bearer ${localStorage.getItem('accesstoken')}`
                    }
                });
*/