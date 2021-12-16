---
title: "Demo Form"
date: 2021-12-10T09:16:11-05:00
---



{{<rawhtml>}}

<script type="text/javascript">var submitted=false;</script>
<iframe name="hidden_iframe" id="hidden_iframe" style="display:none;" 
onload="if(submitted) {window.location='/forms/contactthanks';}"></iframe>

<form action="https://docs.google.com/forms/d/e/1FAIpQLSfDMmGODswEmhvzCOgj16OCZIwjwgNWhAaSdp7d3kAUnwobpA/formResponse"
method="post" target="hidden_iframe" onsubmit="submitted=true;">
</form>




<form action="https://docs.google.com/forms/d/e/1FAIpQLSfDMmGODswEmhvzCOgj16OCZIwjwgNWhAaSdp7d3kAUnwobpA/formResponse"  method="post" target="hidden_iframe" onsubmit="submitted=true">
  <label>Name*</label>
        <input type="text" placeholder="Name*" class="form-input" name="entry.844500701" required>

  <label>Email*</label>
        <input type="email" placeholder="Email address*" class="form-input" name="entry.1597104814" required>

   <label>Give us a bit of background on your k8s deployment</label>
        <textarea rows="5" placeholder="Public Cloud, Vendor Packaging, Upstream?" class="form-input" name="entry.70196611" ></textarea>

   <button type="submit">Send</button>
</form>

 
{{</rawhtml>}}


