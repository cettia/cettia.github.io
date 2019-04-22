if (typeof console !== "undefined") {
  console.log("`cettia` object has loaded", cettia);
}

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
$("#example-tabs + .tabs-content pre.highlight > code, #example-tabs .accordion-content pre.highlight > code").each(function() {
  $(this).html($(this).html().split(/\n/).map(function (line) {
    return /hts|wts/.test(line) ? "<span class='highlighted'>" + line + "</span>" : line;
  }).join('\n'));
});
