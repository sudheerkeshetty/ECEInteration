window.jQuery || document.write('<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js"/>');
var qb = {
    JSAresult: function (qdbdata) {
        eval(qdbdata);
        this.numcols = qdb_numcols;
        this.numrows = qdb_numrows;
        this.heading = qdb_heading.slice();
        if (qdb_numrows > 0) {
            this.data = qdb_data.slice();
        }
    },
    datePicker: function (className, minDate, maxDate) {
        $("." + className).datepicker({
            showOn: 'both',
            buttonImage: 'https://octo.quickbase.com/up/bfhqpy93g/g/rbw/eg/va/icon-calendar.gif',
            buttonImageOnly: true,
            changeMonth: true,
            changeYear: true,
            showAnim: 'slideDown',
            duration: 'fast',
            minDate: minDate,
            maxDate: maxDate,
            dateFormat: "mm-dd-yy",
            defaultDate: +0
        });
    },
    grabXMLval: function (fldname, xmlstring) {
        var t0 = xmlstring.indexOf("<" + fldname) + fldname.length + 2,
            t1 = xmlstring.indexOf("</" + fldname + ">");
        return xmlstring.substring(t0, t1);
    },
    getURL: function (url, action) {
        var xmlData = "<qdbapi></qdbapi>",
            r;
        url = url + "?act=" + action;
        if (action.indexOf("&") != -1)
            action = action.substring(0, action.indexOf("&"));
        $.ajax({
            url: url,
            type: 'POST',
            data: xmlData,
            cache: false,
            dataType: 'text',
            processData: false,
            async: false,
            contentType: 'application/xml',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('QUICKBASE-ACTION', action);
                xhr.setRequestHeader('cache-control', 'no-cache');
                xhr.setRequestHeader('expires-ACTION', '0');
                xhr.setRequestHeader('pragma', 'no-cache');
                return true;
            },
            success: function (response) {
                r = response;
            }
        });
        return r;
    },
    getUserName: function () {
        var response = this.getURL("main", "API_GetUserInfo");
        return this.grabXMLval('firstName', response) + " " + this.grabXMLval('lastName', response);
    },
    getUserEmail: function () {
        var response = this.getURL("main", "API_GetUserInfo");
        return this.grabXMLval('email', response);
    },
    csvUpload: function (tableID, csvString, cListStr) {
        var xmlData = "<qdbapi>\n" + "<records_csv>\n" + "<![CDATA[\n" + csvString + "]]>\n</records_csv>\n<clist>" + cListStr + "</clist>\n<skipfirst>1</skipfirst>\n</qdbapi>",
            r;
        $.ajax({
            url: tableID,
            type: 'POST',
            data: xmlData,
            cache: false,
            dataType: 'text',
            async: false,
            processData: false,
            contentType: 'application/xml',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('QUICKBASE-ACTION', 'API_ImportFromCSV');
                xhr.setRequestHeader('cache-control', 'no-cache');
                xhr.setRequestHeader('expires-ACTION', '0');
                xhr.setRequestHeader('pragma', 'no-cache');
                return true;
            },
            success: function (response) {
                r = response;
            }
        });
        return r;
    },
    upsert: function (tableID, fieldXML, keyORrecordID, id) {
        var action, xmlData, r;
        if (id == "") {
            action = "API_AddRecord";
            xmlData = "<qdbapi>\n" + fieldXML + "\n</qdbapi>";
        } else if (keyORrecordID == "recordID") {
            action = "API_EditRecord";
            xmlData = "<qdbapi>\n<rid>" + id + "</rid>\n" + fieldXML + "\n</qdbapi>";
        } else if (keyORrecordID == "key") {
            action = "API_EditRecord";
            xmlData = "<qdbapi>\n<key>" + id + "</key>\n" + fieldXML + "\n</qdbapi>";
        } else {
            return false;
        }
        $.ajax({
            url: tableID,
            type: 'POST',
            data: xmlData,
            cache: false,
            dataType: 'text',
            async: false,
            processData: false,
            contentType: 'application/xml',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('QUICKBASE-ACTION', action);
                xhr.setRequestHeader('cache-control', 'no-cache');
                xhr.setRequestHeader('expires-ACTION', '0');
                xhr.setRequestHeader('pragma', 'no-cache');
                return true;
            },
            success: function (response) {
                r = response;
            }
        });
        return r;
    },
    logout: function (nexturl) {
        var response = this.getURL("main", "API_SignOut");
        if (nexturl != "") {
            window.location = nexturl;
        }
    },
    sortLink: function (fid) {
        var url = location.href;
        if (url.indexOf("dlta") != -1) {
            url = url.substring(0, url.indexOf("dlta") - 1);
        }
        location.href = url + "^dlta=su" + fid;
    },
    replaceWordChars: function (text) {
        var s = text;
        // smart single quotes and apostrophe
        s = s.replace(/[\u2018|\u2019|\u201A]/g, "\'");
        // smart double quotes
        s = s.replace(/[\u201C|\u201D|\u201E]/g, "\"");
        // ellipsis
        s = s.replace(/\u2026/g, "...");
        // dashes
        s = s.replace(/[\u2013|\u2014]/g, "-");
        // circumflex
        s = s.replace(/\u02C6/g, "^");
        // open angle bracket
        s = s.replace(/\u2039/g, "<");
        // close angle bracket
        s = s.replace(/\u203A/g, ">");
        // spaces
        s = s.replace(/[\u02DC|\u00A0]/g, " ");
        // double quotes with two single quotes
        s = s.replace(/\"/g, "\'\'");
        // ampersand with " and " 
        s = s.replace(/&/g, " and ");
        // less than with symbol
        s = s.replace(/</g, " &lt; ");
        // greater than with symbol 
        s = s.replace(/>/g, " &gt; ");
        return s;
    },
    createFieldXml: function () {
        var temp = "";
        $("[data-fid]").each(function () {
            if ($(this).attr("type") == "radio") {
                if ($("input[name=" + $(this).attr("name") + "]:checked").length > 0)
                    temp += "<field fid='" + $(this).attr("data-fid") + "'>" + $("input[name=" + $(this).attr("name") + "]:checked").val() + "</field>";
            } else {
                temp += "<field fid='" + $(this).attr("data-fid") + "'>" + qb.replaceWordChars($(this).val()) + "</field>";
            }
        });
        return temp;
    }
};
$(document).ready(function () {

    if ($("input[name='searchLabel']").length > 0) {
        $("input[name='searchLabel']").keyup(function () {
            $(".searchTable tbody tr").show();
            var text = $(this).val();
            $(".searchText").each(function () {
                var temp = $(this).text();
                if (temp.toLowerCase().indexOf(text.toLowerCase()) == -1)
                    $(this).closest('tr').hide();
            });
        });
    }

    $("input[placeholder]").change(function () {
        if (this.val() == "") {
            this.val(this.attr("placeholder"));
            this.addClass("placeholderText");
        } else {
            this.removeClass("placeholderText");
        }
    });


    if ($(".freeze").length > 0 && $(".freezeHidden").length > 0) {
        $(window).scroll(function () {
            var freezeParent = $(".freeze").closest("table"),
                bodyOffset = $("body").scrollTop(),
                offset;
            offset = freezeParent.offset();
            if (freezeParent.height() + offset.top > bodyOffset && bodyOffset > offset.top) {
                $(".freeze th").each(function (index) {
                    $("tr.freezeHidden th:nth-child(" + (index + 1) + ")").width($(this).width());
                });
                $(".freezeHidden").show();
            } else {
                $(".freezeHidden").hide();
            }
        });
    }

    if ($(".sortTable").length > 0) {
        $('.sortTable th').click(function (ev) {
            $(".sortUp").remove();
            $(".sortDown").remove();
            var order = $(this).attr('order') === undefined ? "asending" : $(this).attr('order'),
                index = $(this).index(),
                compare_rows = function (a, b) {
                    var a_val = $(a).children('td').eq(index).text().toLowerCase(),
                        b_val = $(b).children('td').eq(index).text().toLowerCase();
                    if (a_val > b_val) return order == "asending" ? 1 : -1;
                    if (a_val < b_val) return order == "asending" ? -1 : 1;
                    return 0;
                };
            $('.sortTable tbody tr').sort(compare_rows).appendTo('.sortTable tbody');
            $(this).attr('order', order == "asending" ? "desending" : "asending");
            order == "asending" ? $(this).append("<p class='sortDown'/>") : $(this).append("<p class='sortUp'/>");
        });
    }

});
