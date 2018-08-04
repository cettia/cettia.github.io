$(document).foundation();
$("#content :header, #index h2, #index h3").each(function() {
  var $this = $(this);
  var $link = $("<a />").attr("href", "#" + $this.attr('id')).text(String.fromCharCode("182"));
  $this.append($link.hide()).hover(function() {
    $link.show();
  }, function() {
    $link.hide();
  });
});
