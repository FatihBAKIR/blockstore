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
exports.reqGet = async(req, res, bs) => {
    const val = bs.Get(req.params.key);
    res.status(200).json(val);
};

/*
 * Path: /req/put
 * Type: POST
 * Desc: submits a key-value pair to be created
 */
exports.reqPut = async(req, res, bs) => {
    bs.Put(req.body.key, req.body.val, Date.now());
    res.status(201).json(req.body.val);
};

/*
 * Path: /req/upd/:key
 * Type: PUT
 * Desc: submits a value to update an exisitng key-value pair
 */
exports.reqUpd = async(req, res, bs) => {
    bs.Update(req.params.key, req.body.val, Date.now());
    res.status(200).json(req.body.val);
};

/*
 * Path: /req/del/:key
 * Type: DELETE
 * Desc: specifies a key to delete its entry
 */
exports.reqDel = async(req, res, bs) => {
    bs.Delete(req.params.key, Date.now());
    res.status(204).end();
};

/*
 * Path: /api
 * Type: GET
 * Desc: returns a list of all valid API paths
 */
exports.api = (req, res, app) => {
    let paths: string[] = [];
    let expr = /\/api/;

    for (let r of app._router.stack) {
      if (r.route && r.route.path && r.route.path.match(expr)) {
        paths.push(r.route.path)
      }
    }

    res.json(paths);
};