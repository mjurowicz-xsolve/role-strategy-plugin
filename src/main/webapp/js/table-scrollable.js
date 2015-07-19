document.observe("dom:loaded", function () {
  var tableScrolableInstances = [];

  var tableScrollablePrototype = function() {
    var i = 0;
    var self;

    function init(tableScrollableEl) {
      if (!tableScrollableEl) {
        throw new Error('Table element for init function is required.');
      }

      self = this;

      this.tableScrollable = tableScrollableEl;
      this.tableClassNames = this.tableScrollable.classNames();
      this.headerRows = this.tableScrollable.select('.scrollable-header-row');
      this.headerCells = this.tableScrollable.select('.scrollable-header-cell');

      wrap.call(this);
      createHeaderWithIntersect.call(this);
      createFirstCol.call(this);
      bindEvents.call(this);
    }

    function wrap() {
      this.wrapper = new Element('div', { class: 'table-scrollable-wrapper'});
      this.tableScrollable.wrap(this.wrapper);
      this.wrapper.setStyle({ width: this.tableScrollable.up('form').getWidth() + 'px' });

      this.wrapper.observe('scroll', function () {
        self.header.setStyle({ 'top': self.wrapper.scrollTop + 'px'});
        self.firstCol.setStyle({ 'left': self.wrapper.scrollLeft + 'px'});
        self.intersect.setStyle({ 'left': self.wrapper.scrollLeft + 'px', 'top': self.wrapper.scrollTop + 'px'});
      });
    }

    function createHeaderWithIntersect() {
      this.header = new Element('table', { class: 'table-scrollable-header'});
      this.header.addClassName(this.tableClassNames);

      this.intersect = new Element('table', { class: 'table-scrollable-intersect'});
      this.intersect.addClassName(this.tableClassNames);

      this.headerRows.each(function(row) {
        self.header.insert(row.clone(true));
      });

      setHeaderWithIntersectCellsSize.call(this);

      this.tableScrollable.insert({ after: this.header });
      this.header.insert({ after: this.intersect });
    }

    function setHeaderWithIntersectCellsSize() {
      i = 0;

      this.intersect.update();
      this.header.writeAttribute('width', ( this.tableScrollable.getWidth() + 2 ) + 'px');
      this.header.select('.scrollable-header-cell').each(function (element) {
          element.setStyle({
            'width': self.headerCells[i].getWidth() + 'px',
            'height': self.headerCells[i].getHeight() + 'px'
          });

          if (element.hasClassName('scrollable-first-col')) {
            self.intersect.insert(element.clone(true));
          }

          i++;
      });
    }

    function createFirstCol() {
      this.firstCol = new Element('table', { class: 'table-scrollable-first-col'});
      this.firstCol.addClassName(this.tableClassNames);

      this.tableScrollable.insert({ before: this.firstCol });

      appendFirstColRows.call(this);
    }

    function appendFirstColRows() {
      if (this.tableScrollable.childElements().length === this.firstCol.childElements().length) {
        return;
      }

      this.firstCol.update();
      this.tableScrollable.select('tr').each(function(row) {
        var firstColCells = row.select('.scrollable-first-col');
        var newRow = new Element('tr');

        firstColCells.each(function(element) {
          var clone = element.clone(true).setStyle({ 'height': element.getHeight() + 'px' });

          newRow.insert(clone);

          if (!clone.down('.scrollable-bind-click')) {
            return;
          }

          clone.on('click', '.scrollable-bind-click', function(e) {
            e.preventDefault();

            element.down('.scrollable-bind-click').click();
          });
        });

        self.firstCol.insert(newRow);
      });
    }

    function bindEvents() {
      this.tableScrollable.up('form').on('click', 'button', function(e) {
        reinitTableScrollable.call(self);
      });

      this.tableScrollable.on('click', '.scrollable-bind-click', function(e) {
        reinitTableScrollable.call(self);
      });
    }

    function reinitTableScrollable() {
      setTimeout(function() {
        setHeaderWithIntersectCellsSize.call(self);
        appendFirstColRows.call(self);
      }, 1);
    }

    return {
      init: init
    };
  };

  $$('.table-scrollable').each(function(element) {
    var instance = Object.create(tableScrollablePrototype());

    tableScrolableInstances.push(instance);
    instance.init.call(instance, element);
  });
});
