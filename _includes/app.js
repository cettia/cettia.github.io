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
document.querySelectorAll("#example-tabs + .tabs-content pre.highlight > code, #example-tabs .accordion-content pre.highlight > code").forEach(elem => {
  Array.from(elem.childNodes).reduce((result, current) => {
    let arr = result[result.length - 1];
    if (current.nodeType === Node.TEXT_NODE && current.textContent[0] === '\n') {
      arr = [];
      result.push(arr);
    }
    arr.push(current);
    return result;
  }, [[]])
  .filter(arr => !arr.find(elem => /hts|wts|\/cettia/.test(elem.textContent)))
  .forEach(arr => arr.filter(elem => elem.nodeType === Node.ELEMENT_NODE).forEach(elem => elem.classList.add("blurred")));
});
