/* Any JavaScript here will be loaded for all users on every page load. */

/* *************************************************************************************
 * 
 *  PERSIAN LANGUAGE-RELATED SCRIPTS
 *
 * *************************************************************************************
 */

/* functions for enabling persian keyboard on textareas and text type inputs */

function keyEnterToPersian(field, e) {
    if ((field.maxLength && field.maxLength != -1 && field.value.length >= field.maxLength) || field.maxLength == 0) {
        return;
    }
    var event = document.all ? window.event : e;
    var key = event.keyCode ? event.keyCode : event.which;
    if (key > 31) {
        if (key < 128) {
            var keys = [
                0x0020, 0x0021, 0x061B, 0x066B, 0xFDFC, 0x066A, 0x060C, 0x06AF,
                0x0029, 0x0028, 0x002A, 0x002B, 0x0648, 0x002D, 0x002E, 0x002F,
                0x06F0, 0x06F1, 0x06F2, 0x06F3, 0x06F4, 0x06F5, 0x06F6, 0x06F7,
                0x06F8, 0x06F9, 0x003A, 0x06A9, 0x003E, 0x003D, 0x003C, 0x061F,
                0x066C, 0x0624, 0x200C, 0x0698, 0x064A, 0x064D, 0x0625, 0x0623,
                0x0622, 0x0651, 0x0629, 0x00BB, 0x00AB, 0x0621, 0x0654, 0x005D,
                0x005B, 0x0652, 0x064B, 0x0626, 0x064F, 0x064E, 0x0670, 0x064C,
                0x0653, 0x0650, 0x0643, 0x062C, 0x005C, 0x0686, 0x00D7, 0x0640,
                0x200D, 0x0634, 0x0630, 0x0632, 0x06CC, 0x062B, 0x0628, 0x0644,
                0x0627, 0x0647, 0x062A, 0x0646, 0x0645, 0x067E, 0x062F, 0x062E,
                0x062D, 0x0636, 0x0642, 0x0633, 0x0641, 0x0639, 0x0631, 0x0635,
                0x0637, 0x063A, 0x0638, 0x007D, 0x007C, 0x007B, 0x007E
            ];
            var code = keys[key - 32];
            if (event.which) {
                pnhMozStringInsert(field, String.fromCharCode(code));
                event.preventDefault();
            } else {
                try {
                    event.keyCode = code;
                } catch(err) {
                }
            }
        }
    }
}
function pnhMozStringInsert(elt, newtext) {
    var posStart = elt.selectionStart;
    var posEnd = elt.selectionEnd;
    var scrollTop = elt.scrollTop;
    var scrollLeft = elt.scrollLeft;

    elt.value = elt.value.slice(0, posStart) + newtext + elt.value.slice(posEnd);
    var newpos = posStart + newtext.length;
    elt.selectionStart = newpos;
    elt.selectionEnd = newpos;
    elt.scrollTop = scrollTop;
    elt.scrollLeft = scrollLeft;
    elt.focus();

}
function switchTextLang(field, event) {
    var event = document.all ? window.event : event;
    if (event.ctrlKey && event.altKey) {
        if (field.lang == "fa") {
            field.dir = "ltr";
            field.onkeypress = function() {
            }
        }
        else {
            field.dir = "rtl";
            field.onkeypress = function(event) {
                keyEnterToPersian(this, event);
            }
        }
    }
    field.lang = field.lang == "fa" ? "en" : "fa";
}

/* persian entry bindings */
/* convert fields is set as persian */
$("select.createboxInput[name*='Example.Language']").each(function(){
  if ($(this).val() == "Persian") {
      /* add persian keyboard setting */
      $(this).parent().parent().parent().find('textarea.metaex').attr("onkeydown","switchTextLang(this, event)").attr("dir","rtl").attr("onkeypress","keyEnterToPersian(this, event)").attr("lang","fa");
      
  }
});

/* attach event to the fieldset so that when a box gets added the effect also applies */
$("legend:contains('Examples')").parent().delegate("select.createboxInput[name*='Example.Language']","change",function(event){
   if ($(this).val() == "Persian") {
      /* add persian keyboard setting */
      $(this).parent().parent().parent().find('textarea.metaex').attr("onkeydown","switchTextLang(this, event)").attr("dir","rtl").attr("onkeypress","keyEnterToPersian(this, event)").attr("lang","fa");
      
   } else {
      /* remove custom keyboard setting */
   $(this).parent().parent().parent().find('textarea.metaex').removeAttr("onkeydown").removeAttr("dir").removeAttr("onkeypress").removeAttr("lang");

   }
});

/* *************************************************************************************
 * 
 *  WORD GLOSSING SCRIPTS
 *
 * *************************************************************************************
 */

(function($) {
    // IGT - Interlinear Gloss Text -- this wrapped set method correctly aligns
    //  words in interlinear gloss text format into columns.  Each element of
    //  the set is expected to contain two or more elements and the text of
    //  each of these sub-elements is considered to be the line.  In the
    //  following example, 'les chiens', 'le-s chien-s' and 'DET-PL dog-PL' are
    //  the lines:
    //
    //    <div class="align-me">
    //      <div>les chiens</div>
    //      <div>le-s chien-s</div>
    //      <div>DET-PL dog-PL</div>
    //    </div>
    //
    //  Basic usage:
    //
    //    $('div.align-me').igt();
    //
    //  Usage with options:
    //
    //    $('div.align-me').igt({buffer: 20, lineGroupBuffer: 5, indent: 60,
    //                          minLineWidthAsPerc: 75});
    //
    //  Method rewritten to accomodate a link around the origin text.  If there is a link
    //  the link is redistributed around each of the origin words.
    //
    $.fn.igt = function (options) {
        // check if div.orig contains a link
        var otextLink = $(this).find("div.orig > a");
        var otextArr = null;
        var linkHref = null;

        if (otextLink.length == 0) {
            // there is no link: split text by spaces
            otextArr = $(this).children("div.orig").html().split(/\s+/);
        } else {
            linkHref = otextLink.attr('href');
            otextArr = otextLink.html().split(/\s+/);
        }

        var gtextArr = $(this).children("div.engloss").html().split(/\s+/);
        var glossdiv = $(this);
        $.each(otextArr, function (index, word) {
            var po;
            if (linkHref==null) {
                po = $(document.createElement('p')).addClass("orig").html(word);
            } else {
                po = $(document.createElement('p')).addClass("orig").append($(document.createElement('a')).attr('href',linkHref).html(word));
            }
            var pg = $(document.createElement('p')).addClass("engloss");
            if (index < gtextArr.length) {
               pg.html(gtextArr[index]);
            }
            $(document.createElement('div')).addClass("unit").append(po,pg).appendTo(glossdiv);
        });
        $(this).children("div.orig").remove();
        $(this).children("div.engloss").remove();
    }

})(jQuery);

/* *************************************************************************************
 * 
 *  RDF EXPORT SHORTCUT SCRIPTS
 *
 * *************************************************************************************
 */

$('#metanetexportowl a').click(function(event){
     event.preventDefault();
     alert("Note: the export takes a few minutes to process.  During that time, the webpage will appear not to be doing anything.  To save the output in OWL/RDF format, use 'File > Save Page As ...' from the browser's menu.");
     // if form was already there, delete it
     $('#metanetexportowl form').remove();
     
     // create and submit a post form
     var form = $('<form name="tripleSearch" method="post" action="https://metaphor.icsi.berkeley.edu/en/index.php?title=Special:ExportRDF" style="display:none"><input type="hidden" name="postform" value="1"/><textarea name="pages" cols="40" rows="10"></textarea><input type="submit" value="Export"/></form>');
     var data = $('#metanetexportowl p.exportlist').html().replace(/,/g,"\n");
     form.find("textarea").html(data);
     $('#metanetexportowl').append(form);
     form.find('input').click();
     return false;
});

/* *************************************************************************************
 * 
 *  JQUERY UI ENHANCEMENTS
 *
 * *************************************************************************************
 */

function getRolesFromFrame(frame, wheretoput, heading, prefix) {
  if (typeof(prefix)==='undefined') prefix = '';
  $.getJSON( mw.util.wikiScript( 'api' ), {
     format: 'json',
     action: 'ask',
     query: '[[Frame:'+frame+']][[Role::+]]|?Role=|+index=1|mainlabel=-|heading=none'
  },function ( data ) {
     $(wheretoput).empty();
     $(wheretoput).append($('<b>'+heading+':</b>'));
     var newul = $(document.createElement('ul'));
     $.each(data.query.results['Frame:'+frame].printouts[''], function(index, rolename) {
       $(document.createElement('li')).html(prefix+rolename).appendTo(newul);
     });
     $(wheretoput).append(newul);
  });
}

function doFrameRolesLookup() {
    $('input.RoleLookupField').each(function() {
        var name = $(this).attr("name");
        var frame = $(this).val();
        if (frame==="") {
           return;
        }
        if (name == "Metaphor[Target frame]") {
           getRolesFromFrame(frame, '#TargetRoleResults', 'Target Roles ('+frame+')');
        } else if (name == "Metaphor[Source frame]") {
           getRolesFromFrame(frame, '#SourceRoleResults', 'Source Roles ('+frame+')');
        }
    });
}

function doRelatedFrameRolesLookup() {
    var $todiv = $('#RelatedFrameRoles');
    $todiv.empty();
    var $tr = $(document.createElement('tr'));
    var $firsttd = $(document.createElement('td'));
    $firsttd.append($('<b>This Frame&apos;s Roles:</b>'));
    var $ul = $(document.createElement('ul'));
    $('input.LocalFrameRoleName').each(function() {
        var val = $(this).val();
        if (val==="") return;
        $ul.append($(document.createElement('li')).html(val));
    });
    $tr.append($firsttd.append($ul)).append($('<td>&nbsp;&nbsp;&nbsp;</td>'));
    $('input.RelatedFrameField').each(function() {
        var frame = $(this).val();
        if (frame==="") return;

        var td = document.createElement('td');
        getRolesFromFrame(frame, td, 'Roles ('+frame+')',frame+'.');
        $tr.append($(td)).append($('<td>&nbsp;&nbsp;&nbsp;</td>'));
    });
    $todiv.append($(document.createElement('table')).append($tr));
}

$(document).ready(function(){

    // if there is glossed text, then process it
    $('div.glossedtext').each(function(index) {
        $(this).igt();
    });
    $('input.RoleLookupField').blur(doFrameRolesLookup);
    doFrameRolesLookup();

    // these events delegated because they are multi-entry fields that are not guaranteed to exist
    // at page load time
    $("legend:contains('Roles')").parent()
        .delegate('input.LocalFrameRoleName','blur',doRelatedFrameRolesLookup)
        .delegate('input.remover','click',doRelatedFrameRolesLookup);
    $("legend:contains('Related Frames')").parent()
        .delegate('input.RelatedFrameField','blur',doRelatedFrameRolesLookup)
        .delegate('input.remover','click',doRelatedFrameRolesLookup);
    doRelatedFrameRolesLookup();
});

mw.loader.using( ['jquery.ui.tabs'], function() {
     $(document).ready(function() {
        // tab-ize metaphorfamilygraphs
        $('#metaphorfamilygraphs').tabs({selected: 1}); // default selection is the metaphor tab
        $('#metaphorrelationstabs').tabs({selected: 1});
     });
});
