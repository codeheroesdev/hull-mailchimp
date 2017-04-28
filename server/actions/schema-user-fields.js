/* @flow */
import { Request, Response } from "express";
export default function schemaUserFields(req: Request, res: Response) {
  req.hull.shipApp.mailchimpAgent.getMergeFields()
    .then(resBody => {
      res.json({
        options: resBody.merge_fields.map(f => {
          return { label: f.name, value: f.tag };
        })
      });
    }, () => {
      res.json({ options: [] });
    });
}
