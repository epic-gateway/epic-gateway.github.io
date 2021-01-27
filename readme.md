This is the external website.  

Master is the current version of the website

It is not deployed directly from the repo.  It is copied to GCP buckets for deployment

### Copying to GCP for deployment
1. Uncomment googleAnalytics in config.toml
2. Render the site locally using hugo
3. Log into GCP, switch to External Website Project
4. www.acnodal.com - delete existing if necessary - Copy using gsutil cp -r * gs://www.acnodal.com
5. www.acnodal.io - delete existing if necessary - Copy using gsutil cp -r * gs://www.acnodal.io


### Generation
The website is generated using hugo.  It includes a template called acnodalTheme providing
the basic structure of the site


### Content information

#### Colors

| Color  | Code | Use |
|--------|-----| ----|
| dark green | #005800| from the logo, used as a text color |
| light green | #00ff06 | bright green from logo, used for highlights |
| k8s blue | #326de6 | blue used in k8s logos |


