/*
 * Path: /
 * Type: GET
 * Desc: returns a list of all valid paths
 */
exports.root = (req, res, app) => {
    let paths: string[] = [];

    for (let r of app._router.stack) {
      if (r.route && r.route.path) {
        paths.push(r.route.path)
      }
    }

    res.json(paths);
};

/*
 * Path: /req
 * Type: GET
 * Desc: returns a list of all valid operation request handling paths
 */
exports.req = (req, res, app) => {
    let paths: string[] = [];
    let expr = /\/op/;

    for (let r of app._router.stack) {
      if (r.route && r.route.path && r.route.path.match(expr)) {
        paths.push(r.route.path)
      }
    }

    res.status(200).json(paths);
};

/*
 * Path: /req/get/:key
 * Type: GET
 * Desc: specifies a key to get its corresponding value
 */
exports.get = async(req, res, bs) => {

    if (value === undefined)
    {
        res.status(404).end();
    }
    res.status(200).json(value);
};

/*
 * Path: /req/post
 * Type: POST
 * Desc: submits a key-value pair to be created
 */
exports.post = async(req, res) => {
    const success = kv.Post(req.body.key, req.body.val);
    if (success == false) {
        res.status(409).end();
    }
    res.status(201).json(req.body.val);
};

/*
 * Path: /req/put
 * Type: PUT
 * Desc: submits a value to update an exisitng key-value pair
 */
exports.put = async(req, res) => {
    const success = kv.Update(req.params.key, req.body.val);
    if (success == false) {
        res.status(404).end();
    }
    res.status(200).json(req.body.val);
};

/*
 * Path: /req/delete/:key
 * Type: DELETE
 * Desc: specifies a key to delete its entry
 */
exports.delete = async(req, res) => {
    const success = kv.Delete(req.params.key);
    if (success == false) {
        res.status(404).end();
    }
    res.status(204).end();
};

/*
 * Path: /api
 * Type: GET
 * Desc: returns a list of all valid API paths
 */
app.get("/api", (req, res) => {
    let paths: string[] = [];
    let expr = /\/api/;

    for (let r of app._router.stack) {
      if (r.route && r.route.path && r.route.path.match(expr)) {
        paths.push(r.route.path)
      }
    }

    res.json(paths);
});