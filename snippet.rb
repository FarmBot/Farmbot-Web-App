require "rest-client"
URL   = 'https://storage.googleapis.com/farmbot-staging/'
file  = File.new("spec/fixture.jpg")

RestClient.post(URL, {:key=>"temp1/b8333d4d-e47e-407b-92fd-073454dfd8f5.jpg",
 :acl=>"public-read",
 :"Content-Type"=>"image/jpeg",
 :policy=>
  "eyJleHBpcmF0aW9uIjoiMjAxNy0wMS0xM1QyMDowMzo1NVoiLCJjb25kaXRpb25zIjpbeyJidWNrZXQiOiJmYXJtYm90LXN0YWdpbmcifSx7ImtleSI6InRlbXAxL2I4MzMzZDRkLWU0N2UtNDA3Yi05MmZkLTA3MzQ1NGRmZDhmNS5qcGcifSx7ImFjbCI6InB1YmxpYy1yZWFkIn0seyJDb250ZW50LVR5cGUiOiJpbWFnZS9qcGVnIn0sWyJjb250ZW50LWxlbmd0aC1yYW5nZSIsMSw0MTk0MzA0XV19",
 :signature=>"VY/brZdXTxW7SdZBp7JcvEEiMvY=",
 :GoogleAccessId=>"GOOGSDXDNLBL7DHPNZTT",
 :file=>file})
