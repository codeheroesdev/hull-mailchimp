

export default function schemaUserFields(req, res) {
  req.shipApp.mailchimpAgent.getMergeFields()
    .then(resBody => {
      res.json({
        options: resBody.merge_fields.map(f => {
          return { label: f.name, value: f.tag };
        })
      });
    });
}
